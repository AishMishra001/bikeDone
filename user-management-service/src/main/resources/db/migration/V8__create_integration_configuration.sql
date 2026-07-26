CREATE TABLE integration_configuration
(
    id UUID PRIMARY KEY,

    provider VARCHAR(50) NOT NULL,

    configuration_name VARCHAR(100) NOT NULL,

    configuration JSONB NOT NULL,

    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT uk_provider_name UNIQUE(provider, configuration_name)
);

INSERT INTO integration_configuration
(
    id,
    provider,
    configuration_name,
    configuration,
    description,
    is_active,
    created_at,
    updated_at
)
VALUES
    (
        gen_random_uuid(),

        'FIREBASE',

        'Bike Done Firebase',

        $${
  "type": "service_account",
  "project_id": "bike-done",
  "private_key_id": "904729be7e2bb68d197d80ea5ca0a886cb1ffb15",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDWYN/N6zkByX8n\nRrma3cGWcaPCO5AJ3VxA0aic0gtoEgv27b4zXRgF/5c8O4xQa3MtyQJSyIgftdt7\nJgE7A3T5wNhhUtAggxGQq2xsLUad9rpfbaZoDgxwH47IEXG9P3pfaXCyAa0FDFKx\ntgQCEAtzEKWqAcjPpBIypJRlgd4IfGbpWBp+WvqEBs4ZFhBJJFbd8JYxPeAthZLf\n1GeGu3QyyUMYFxDTxmI3W6W5Sco3V1lk8RYaK2Am1cYFV4WhhDxKqMnngljpRPwo\n8nSFlnf5FmU4w0QeU5kYVVAY3CcyZpsCMgkKCYzpH3ZQ9Pz4xgp2l9ecHg6vBQVp\nhgOumlDdAgMBAAECggEAATt/0gZ5bvX0tvld1dQHPNJ855LupBHzgXeqy1Djz1d7\nXbgZK8R1caf6ADW8r+6hdn2t39UucO6ZD+p0hDUrAnMmH3MJHO9T9fxgq9Z11R24\nKgNHfZF2qbGJMemn6JG9iZkkFG/SNvs7sQ/PuJGcajPMbVhizKakDkoRl4OTaP15\nxUvKc/PVW4xOFE4MudKCa7/l6O+JLFQXiaiy70Qed7gqGDLAqbUakBliWcXKuC+/\ncu8CJaleROrvNwqlDrAahRhNKlijdW6VE2xwlNVkDQ5DpTtJ6zTqYHroLzSaPZ5V\nxJ9CQNKCrQq4ja2+DiDtIuGW7ZTcvaCI/olLGJ1aUQKBgQDuSS1oUBu4BpVhZ7Ho\nh1c0+qCWyrYVa2SjntGan8/4u9DnBb+NmwV5vDTaf8IKX9xOa3IbHmx8AhzRsT6r\nB8uA1XTHX6/LNeuqzImQVJbckARCEpXebwXh8MSxyAhxTfaezn1g8KPYJv66iCsX\n9Oe0T6MZEk/Q05Rw7n9nDcBK+QKBgQDmULbJ9e6+o2vQaeH9MBT3e8ou00iwqlfJ\nVamMg4DYud87bJPNwKG4VtkT8sFIsigaznQd5heywy32CyLD02fb4AC1X0zalbad\nci4gKiwXOaU70IUF+Cu1umQjoZDH2VnKWjD1zoNgu0o3uBQtJxaQ3oBBUoufW2jc\nFE33wOwqBQKBgDOuP2DubvScyO1VViq+n9Vnvki2MoO2xR8PpRpKKwshgQ96Ga+W\nvbtHbJcvOmCRpfCEMT1cfd7vflykepkRmbuZkDhlsnT6fuCOeA+LqSSxP5ss+MBD\niB0W4TJF1j7sz95lnp/V0VNiMcE3I1GQ1mgvFYqshA8gtINB1vP88YXRAoGAcF57\nAEhcRmjnRlUSrHwUDrc36uas9Xz2vcVspqDWcWcmchDEgEN248CDwwbSpMw/YuzN\nnHTRpSczOnMucAqqBo3g6pznm1ImOeUmegz5XA+E/Yz8CfCOKukYyIWgZNE3zNF6\nR8ONN9nJGSxXs7v5d48HVleWxZZMr+u8Kp/W2Z0CgYEAqz8daB7dCJL7Z7oWDZJb\nUXVk2TXRLnuaxWfrC3vtxJWW2h3CYxPBgg0z+iSAcBx+HAM46brpXS7w2PFdrH0e\n86xj0YbDDUq7IIzvOEOhCtC3J2w9V4FPsKQekwvFdWFL7kFrqhGPEzRgge57oiej\ndjYJckerdfE2pGK0OcNrcfI=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@bike-done.iam.gserviceaccount.com",
  "client_id": "113111925611329544756",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40bike-done.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
            $$::jsonb,

        'Firebase Phone Authentication',

        true,

        now(),

        now()
    );


INSERT INTO integration_configuration
(
    id,
    provider,
    configuration_name,
    configuration,
    description,
    is_active,
    created_at,
    updated_at
)
VALUES
    (
        gen_random_uuid(),

        'AWS_SNS',

        'AWS SNS',

        $${
          "accessKey":"AKIA4ROTTVYJEABGUBCD",
          "secretKey":"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",
          "region":"ap-south-1"
        }$$::jsonb,

        'AWS SNS SMS',

        false,

        now(),

        now()
    );

UPDATE integration_configuration
SET is_active = true
WHERE provider = 'FIREBASE';

UPDATE integration_configuration
SET is_active = false
WHERE provider = 'AWS_SNS';