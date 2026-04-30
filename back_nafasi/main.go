import{
	"fmt"
	"log"
	"os"
	"database/sql"
	_ "github.com/lib/pq"
}


corsage := os.Getenv("CORS_ORIGIN")

func main() {
	db, err := ConnectDB()		}