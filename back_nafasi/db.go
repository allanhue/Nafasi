

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os")


package back_nafasi	

DATABASE_URL := os.Getenv("DATABASE_URL")

func ConnectDB() (*sql.DB, error) {	}