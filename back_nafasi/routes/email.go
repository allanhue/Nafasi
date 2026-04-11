package routes

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
)

type EmailService struct {
	apiKey    string
	fromEmail string
	fromName  string
}

func NewEmailService() *EmailService {
	return &EmailService{
		apiKey:    os.Getenv("BREVO_API_KEY"),
		fromEmail: os.Getenv("MAIL_FROM"),
		fromName:  os.Getenv("MAIL_FROM_NAME"),
	}
}

type EmailRequest struct {
	To          []map[string]string `json:"to"`
	Subject     string              `json:"subject"`
	HtmlContent string              `json:"htmlContent"`
	Sender      map[string]string   `json:"sender"`
}

func (e *EmailService) SendEmail(toEmail, toName, subject, htmlContent string) error {
	if e.apiKey == "" {
		return fmt.Errorf("BREVO_API_KEY not configured")
	}

	if strings.TrimSpace(e.fromEmail) == "" {
		return fmt.Errorf("MAIL_FROM not configured")
	}

	fromName := e.fromName
	if strings.TrimSpace(fromName) == "" {
		fromName = "Nafasi"
	}

	emailReq := EmailRequest{
		To: []map[string]string{
			{"email": toEmail, "name": toName},
		},
		Subject:     subject,
		HtmlContent: htmlContent,
		Sender: map[string]string{
			"email": e.fromEmail,
			"name":  fromName,
		},
	}

	payload, err := json.Marshal(emailReq)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", "https://api.brevo.com/v3/smtp/email", bytes.NewBuffer(payload))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("api-key", e.apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("brevo api error: status %d", resp.StatusCode)
	}

	return nil
}

// Notification email templates
func (e *EmailService) SendPaymentNotification(toEmail, toName, tenantName, amount string) error {
	subject := "Payment Notification"
	htmlContent := fmt.Sprintf(`
		<h2>Payment Confirmation</h2>
		<p>Hi %s,</p>
		<p>This is to confirm that payment of %s has been received for tenant %s.</p>
		<p>Best regards,<br>Nafasi Team</p>
	`, toName, amount, tenantName)

	return e.SendEmail(toEmail, toName, subject, htmlContent)
}

func (e *EmailService) SendMaintenanceAlert(toEmail, toName, propertyName, description string) error {
	subject := "Maintenance Request Alert"
	htmlContent := fmt.Sprintf(`
		<h2>New Maintenance Request</h2>
		<p>Hi %s,</p>
		<p>A new maintenance request has been created for %s.</p>
		<p><strong>Description:</strong> %s</p>
		<p>Please address this issue at your earliest convenience.</p>
		<p>Best regards,<br>Nafasi Team</p>
	`, toName, propertyName, description)

	return e.SendEmail(toEmail, toName, subject, htmlContent)
}

func (e *EmailService) SendBookingConfirmation(toEmail, toName, spaceName, startDate, endDate string) error {
	subject := "Booking Confirmation"
	htmlContent := fmt.Sprintf(`
		<h2>Booking Confirmed</h2>
		<p>Hi %s,</p>
		<p>Your booking for %s has been confirmed.</p>
		<p><strong>Check-in:</strong> %s<br><strong>Check-out:</strong> %s</p>
		<p>Thank you for choosing Nafasi!</p>
		<p>Best regards,<br>Nafasi Team</p>
	`, toName, spaceName, startDate, endDate)

	return e.SendEmail(toEmail, toName, subject, htmlContent)
}
