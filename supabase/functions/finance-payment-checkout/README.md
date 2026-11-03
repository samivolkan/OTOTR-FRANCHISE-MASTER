# finance-payment-checkout

Trusted ERP/BFF-only checkout initiation route. The caller sends only actor ID, external invoice ID and an HTTPS return URL. Invoice amount, currency, dealer and branch scope are loaded server-side. The provider token is SHA-256 hashed before the existing outbox/audit session RPC is called; neither raw card data nor the raw provider token is persisted or returned.

The configured provider endpoint must implement the canonical OTOTR checkout adapter contract. A real provider-specific mapper and sandbox/3D Secure evidence remain mandatory before staging signoff.
