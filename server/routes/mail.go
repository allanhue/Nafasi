package routes

import (
	"encoding/json"
	"errors"
	"net/http"

	"nafasi_new/back_nafasi/service"
)

type Mailer struct {
	service *service.Mailer
}

func NewMailer(mailService *service.Mailer) *Mailer {
	return &Mailer{service: mailService}
}

func (m *Mailer) SubscriptionInterest(w http.ResponseWriter, r *http.Request) {
	var input service.SubscriptionInterestInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if err := m.service.SubscriptionInterest(input); err != nil {
		writeMailError(w, err)
		return
	}
	WriteJSON(w, http.StatusOK, map[string]string{"message": "Subscription interest sent"})
}

func (m *Mailer) HelpRequest(w http.ResponseWriter, r *http.Request) {
	var input service.HelpRequestInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if err := m.service.HelpRequest(input); err != nil {
		writeMailError(w, err)
		return
	}
	WriteJSON(w, http.StatusOK, map[string]string{"message": "Help request sent"})
}

func writeMailError(w http.ResponseWriter, err error) {
	var mailErr *service.MailError
	if errors.As(err, &mailErr) {
		writeError(w, mailErr.Status, mailErr.Message)
		return
	}
	writeError(w, http.StatusInternalServerError, "Could not process mail request")
}
