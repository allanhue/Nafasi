# nafasi
> One platform. Three services. Built for Kenyan SMEs.


**Nafasi**  is a multi-tenant SaaS platform that unifies rental property management, inventory tracking and space booking under a single identity.

The same user can hold multiple roles simultaneously. A landlord can also manage a warehouse and list a rooftop as a bookable event space — one login, one dashboard, context switcher in the sidebar.


## Getting started

### Prerequisites

- Node.js 18+
- Go 1.21+
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Clone the repo
git clone https://github.com/yourorg/nafasi.git
cd nafasi

# Install frontend dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```



# Redis
REDIS_URL=redis://localhost:6379
```

### Run locally

```bash
# Start the frontend
npm run dev


---

## Contributing

This is currently a solo build. If you want to contribute, open an issue first to discuss what you'd like to change.

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes, then
git commit -m "feat: describe what you did"
git push origin feature/your-feature-name
```

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).

---

## License

Private and confidential. All rights reserved.
