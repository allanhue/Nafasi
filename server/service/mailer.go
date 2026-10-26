package service

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

type MailContact struct {
	Email string `json:"email"`
	Name  string `json:"name,omitempty"`
}

type MailMessage struct {
	To       []MailContact
	Subject  string
	TextBody string
	HTMLBody string
}

type SubscriptionInterestInput struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Plan  string `json:"plan"`
	Role  string `json:"role"`
}

type HelpRequestInput struct {
	Issue string `json:"issue"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

type MailError struct {
	Status  int
	Message string
}

func (e *MailError) Error() string {
	return e.Message
}

type Mailer struct {
	apiKey     string
	useAPI     bool
	fromEmail  string
	fromName   string
	supportTo  string
	httpClient *http.Client
}

func NewMailerFromEnv() *Mailer {
	return &Mailer{
		apiKey: os.Getenv("BREVO_API_KEY"), useAPI: strings.EqualFold(os.Getenv("BREVO_USE_API"), "true"),
		fromEmail: os.Getenv("MAIL_FROM"), fromName: os.Getenv("MAIL_FROM_NAME"), supportTo: os.Getenv("SUPPORT_MAIL_TO"),
		httpClient: &http.Client{Timeout: 10 * time.Second},
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
		"sender": map[string]string{"email": m.fromEmail, "name": m.fromName},
		"to":     message.To, "subject": message.Subject,
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

func (m *Mailer) SubscriptionInterest(input SubscriptionInterestInput) error {
	input.Name = strings.TrimSpace(input.Name)
	input.Email = strings.TrimSpace(strings.ToLower(input.Email))
	input.Plan = strings.TrimSpace(input.Plan)
	input.Role = strings.TrimSpace(input.Role)
	if input.Name == "" || input.Email == "" || input.Plan == "" {
		return &MailError{Status: http.StatusBadRequest, Message: "Name, email, and plan are required"}
	}
	adminTo := m.supportTo
	if adminTo == "" {
		adminTo = m.fromEmail
	}
	if adminTo != "" {
		if err := m.Send(MailMessage{
			To:       []MailContact{{Email: adminTo, Name: "Nafasi support"}},
			Subject:  "New Nafasi subscription interest",
			TextBody: fmt.Sprintf("Name: %s\nEmail: %s\nPlan: %s\nRole: %s", input.Name, input.Email, input.Plan, input.Role),
		}); err != nil {
			return &MailError{Status: http.StatusBadGateway, Message: "Could not send subscription email"}
		}
	}
	_ = m.Send(MailMessage{
		To:       []MailContact{{Email: input.Email, Name: input.Name}},
		Subject:  "Nafasi subscription request received",
		TextBody: "Thanks for your interest in Nafasi. Create your account to continue setting up your workspace.",
	})
	return nil
}

func (m *Mailer) HelpRequest(input HelpRequestInput) error {
	input.Issue = strings.TrimSpace(input.Issue)
	input.Email = strings.TrimSpace(strings.ToLower(input.Email))
	input.Name = strings.TrimSpace(input.Name)
	if len(input.Issue) < 10 {
		return &MailError{Status: http.StatusBadRequest, Message: "Please describe the issue in at least 10 characters"}
	}
	adminTo := m.supportTo
	if adminTo == "" {
		adminTo = m.fromEmail
	}
	if adminTo == "" {
		return &MailError{Status: http.StatusInternalServerError, Message: "Support email is not configured"}
	}
	fromLine := "User did not provide profile details"
	if input.Email != "" || input.Name != "" {
		fromLine = fmt.Sprintf("Name: %s\nEmail: %s", input.Name, input.Email)
	}
	if err := m.Send(MailMessage{
		To:       []MailContact{{Email: adminTo, Name: "Nafasi support"}},
		Subject:  "New Nafasi help request",
		TextBody: fmt.Sprintf("%s\n\nIssue:\n%s", fromLine, input.Issue),
	}); err != nil {
		return &MailError{Status: http.StatusBadGateway, Message: "Could not send help request"}
	}
	return nil
}
