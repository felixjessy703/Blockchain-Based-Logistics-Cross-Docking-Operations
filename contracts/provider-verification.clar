;; Logistics Provider Verification Contract
;; Validates and manages cross-docking logistics providers

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_PROVIDER_NOT_FOUND (err u101))
(define-constant ERR_PROVIDER_ALREADY_EXISTS (err u102))
(define-constant ERR_INVALID_RATING (err u103))

;; Provider data structure
(define-map providers
  { provider-id: uint }
  {
    name: (string-ascii 50),
    address: principal,
    verified: bool,
    rating: uint,
    total-shipments: uint,
    registration-block: uint
  }
)

(define-data-var next-provider-id uint u1)

;; Register a new logistics provider
(define-public (register-provider (name (string-ascii 50)) (provider-address principal))
  (let ((provider-id (var-get next-provider-id)))
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (asserts! (is-none (map-get? providers { provider-id: provider-id })) ERR_PROVIDER_ALREADY_EXISTS)

    (map-set providers
      { provider-id: provider-id }
      {
        name: name,
        address: provider-address,
        verified: false,
        rating: u0,
        total-shipments: u0,
        registration-block: block-height
      }
    )

    (var-set next-provider-id (+ provider-id u1))
    (ok provider-id)
  )
)

;; Verify a provider
(define-public (verify-provider (provider-id uint))
  (let ((provider (unwrap! (map-get? providers { provider-id: provider-id }) ERR_PROVIDER_NOT_FOUND)))
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)

    (map-set providers
      { provider-id: provider-id }
      (merge provider { verified: true })
    )
    (ok true)
  )
)

;; Update provider rating
(define-public (update-rating (provider-id uint) (new-rating uint))
  (let ((provider (unwrap! (map-get? providers { provider-id: provider-id }) ERR_PROVIDER_NOT_FOUND)))
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (asserts! (<= new-rating u5) ERR_INVALID_RATING)

    (map-set providers
      { provider-id: provider-id }
      (merge provider { rating: new-rating })
    )
    (ok true)
  )
)

;; Get provider details
(define-read-only (get-provider (provider-id uint))
  (map-get? providers { provider-id: provider-id })
)

;; Check if provider is verified
(define-read-only (is-provider-verified (provider-id uint))
  (match (map-get? providers { provider-id: provider-id })
    provider (get verified provider)
    false
  )
)
