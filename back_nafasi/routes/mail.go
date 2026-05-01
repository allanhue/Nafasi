package routes

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

const brevoSMTPURL = "https://api.brevo.com/v3/smtp/email"

type Mailer struct {
	apiKey     string
	useAPI     bool
	fromEmail  string
	fromName   string
	supportTo  string
	httpClient *http.Client
}

type MailMessage struct {
	To       []MailContact
	Subject  string
	TextBody string
	HTMLBody string
}

type MailContact struct {
	Email string `json:"email"`
	Name  string `json:"name,omitempty"`
}

func NewMailerFromEnv() *Mailer {
	return &Mailer{
		apiKey:    os.Getenv("BREVO_API_KEY"),
		useAPI:    strings.EqualFold(os.Getenv("BREVO_USE_API"), "true"),
		fromEmail: os.Getenv("MAIL_FROM"),
		fromName:  os.Getenv("MAIL_FROM_NAME"),
		supportTo: os.Getenv("SUPPORT_MAIL_TO"),
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (m *Mailer) Send(message MailMessage) error {
	if len(message.To) == 0 {
		return errors.New("at least one recipient is required")
	}
	if message.Subject == "" || (message.TextBody == "" && message.HTMLBody == "") {
		return errors.New("subject and message body are required")
	}
	if m.fromEmail == "" {
		return errors.New("MAIL_FROM is not set")
	}

	if !m.useAPI {
		log.Printf("mail api disabled; would send %q to %d recipient(s)", message.Subject, len(message.To))
		return nil
	}
	if m.apiKey == "" {
		return errors.New("BREVO_API_KEY is not set")
	}

	payload := map[string]any{
		"sender": map[string]string{
			"email": m.fromEmail,
			"name":  m.fromName,
		},
		"to":      message.To,
		"subject": message.Subject,
	}
	if message.TextBody != "" {
		payload["textContent"] = message.TextBody
	}
	if message.HTMLBody != "" {
		payload["htmlContent"] = message.HTMLBody
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPost, brevoSMTPURL, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("api-key", m.apiKey)

	resp, err := m.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("brevo returned status %d", resp.StatusCode)
	}

	return nil
}

func (m *Mailer) SubscriptionInterest(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name  string `json:"name"`
		Email string `json:"email"`
		Plan  string `json:"plan"`
		Role  string `json:"role"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Plan = strings.TrimSpace(req.Plan)
	req.Role = strings.TrimSpace(req.Role)

	if req.Name == "" || req.Email == "" || req.Plan == "" {
		writeError(w, http.StatusBadRequest, "Name, email, and plan are required")
		return
	}

	adminTo := m.supportTo
	if adminTo == "" {
		adminTo = m.fromEmail
	}

	if adminTo != "" {
		err := m.Send(MailMessage{
			To:      []MailContact{{Email: adminTo, Name: "Nafasi support"}},
			Subject: "New Nafasi subscription interest",
			TextBody: fmt.Sprintf(
				"Name: %s\nEmail: %s\nPlan: %s\nRole: %s",
				req.Name,
				req.Email,
				req.Plan,
				req.Role,
			),
		})
		if err != nil {
			writeError(w, http.StatusBadGateway, "Could not send subscription email")
			return
		}
	}

	_ = m.Send(MailMessage{
		To:       []MailContact{{Email: req.Email, Name: req.Name}},
		Subject:  "Nafasi subscription request received",
		TextBody: "Thanks for your interest in Nafasi. Create your account to continue setting up your workspace.",
	})

	WriteJSON(w, http.StatusOK, map[string]string{
		"message": "Subscription interest sent",
	})
}
