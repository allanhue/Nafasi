package model

import (
	"context"
	"database/sql"
	"time"
)

type User struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"createdAt"`
}

type UserCredential struct {
	User         User
	PasswordHash string
}

type AuthSession struct {
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expiresAt"`
	User      User      `json:"user"`
}

type UserInput struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type UserRoleInput struct {
	Role string `json:"role"`
}

type Auth struct {
	db *sql.DB
}

func NewAuth(db *sql.DB) *Auth {
	return &Auth{db: db}
}

func (m *Auth) UserCredentialByEmail(ctx context.Context, email string) (UserCredential, error) {
	credential := UserCredential{}
	err := m.db.QueryRowContext(ctx,
		`SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = $1`,
		email,
	).Scan(&credential.User.ID, &credential.User.Name, &credential.User.Email,
		&credential.PasswordHash, &credential.User.Role, &credential.User.CreatedAt)
	return credential, err
}

func (m *Auth) CreateUser(ctx context.Context, input UserInput, passwordHash string) (User, error) {
	user := User{}
	err := m.db.QueryRowContext(ctx,
		`INSERT INTO users (name, email, password_hash, role)
		 VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at`,
		input.Name, input.Email, passwordHash, input.Role,
	).Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.CreatedAt)
	return user, err
}

func (m *Auth) ListUsers(ctx context.Context) ([]User, error) {
	rows, err := m.db.QueryContext(ctx,
		`SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 100`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	users := []User{}
	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.CreatedAt); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, rows.Err()
}

func (m *Auth) UpdateUserRole(ctx context.Context, id int64, role string) (User, error) {
	user := User{}
	err := m.db.QueryRowContext(ctx,
		`UPDATE users SET role = $1, updated_at = NOW()
		 WHERE id = $2 RETURNING id, name, email, role, created_at`,
		role, id,
	).Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.CreatedAt)
	return user, err
}

func (m *Auth) UserForToken(ctx context.Context, tokenHash string) (User, error) {
	user := User{}
	err := m.db.QueryRowContext(ctx,
		`SELECT u.id, u.name, u.email, u.role, u.created_at
		 FROM auth_sessions s JOIN users u ON u.id = s.user_id
		 WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
		tokenHash,
	).Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.CreatedAt)
	return user, err
}

func (m *Auth) CreateSession(ctx context.Context, userID int64, tokenHash string, expiresAt time.Time) error {
	_, err := m.db.ExecContext(ctx,
		`INSERT INTO auth_sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
		userID, tokenHash, expiresAt,
	)
	return err
}
