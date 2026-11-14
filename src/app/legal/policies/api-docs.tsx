import React from "react";

export function ApiDocsContent() {
  return (
    <div className="space-y-6 text-black">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-black">
        API DOCS
      </h2>

      <p className="text-base leading-relaxed text-black">
        For businesses with existing websites or applications, Trite offers a Merchant API that allows seamless integration of payment checkout. Integrate Trite payments into your e-commerce site or app.
      </p>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">1. Purpose</h3>
        <p className="text-base leading-relaxed text-black">
          Trite API Development &amp; Integration Policy document (“Policy”) establishes the requirements, responsibilities, security standards, and acceptable-use rules governing access to and use of the Trite (“Platform”) APIs by merchants, businesses, developers, and authorized third-party service providers (“Merchant” or “you”).
        </p>
        <p className="text-base leading-relaxed text-black">
          By registering for an account, requesting API credentials, or integrating your systems with our APIs, you acknowledge that you have read, understood, and agreed to comply with this Policy, our Terms and Conditions, Privacy Policy, and any applicable laws and regulations.
        </p>
        <p className="text-base leading-relaxed text-black">
          Failure to comply with this Policy may result in API restrictions, suspension, termination of API access, withholding of transactions, or closure of your merchant account.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">2. Eligibility for API Access</h3>
        <p className="text-base leading-relaxed text-black">
          API access is provided only to merchants who:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2 text-base text-black">
          <li>Have successfully completed Trite registration and onboarding process.</li>
          <li>Have provided accurate, complete, and current business information.</li>
          <li>Have successfully completed any required identity, business, or compliance verification.</li>
          <li>Are legally permitted to conduct the business and payment activities for which Trite is being used.</li>
          <li>Have completed all the KYCs set out by Trite.</li>
          <li>Agree to comply with applicable payment, financial, consumer-protection, data-protection, anti-money-laundering, and other relevant laws.</li>
          <li>Use the API only for the business activities approved by the Trite.</li>
        </ul>
        <p className="text-base leading-relaxed text-black">
          Trite reserve the right to request additional documentation or information before approving API access.
        </p>
        <p className="text-base leading-relaxed text-black">
          Trite API access is a privilege and is not guaranteed solely because a merchant has registered on Trite.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">3. API Environment</h3>
        <p className="text-base leading-relaxed text-black">
          Trite may provide separate environments for development, testing, and production.
        </p>
        <p className="text-base leading-relaxed text-black">
          <strong>3.1 Sandbox Environment:</strong> Trite sandbox environment is provided for testing integrations before they are connected to live payment services. Merchants must use test credentials and test data within the sandbox environment unless expressly authorized otherwise. Trite Sandbox transactions do not represent real financial transactions unless explicitly stated by the Trite.
        </p>
        <p className="text-base leading-relaxed text-black">
          <strong>3.2 Production Environment:</strong> Trite production API credentials may only be used after the Merchant has completed the required onboarding process, finished KYCs, testing, and approval procedures. Merchants are responsible for ensuring that their production integration has been adequately tested before processing live transactions.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">4. API Credentials and Security</h3>
        <p className="text-base leading-relaxed text-black">
          Trite API keys, client secrets, access tokens, signing keys, webhook secrets, and other authentication credentials (“API Credentials”) are confidential.
        </p>
        <p className="text-base leading-relaxed text-black">
          Merchants must:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2 text-base text-black">
          <li>Keep API Credentials secure and confidential.</li>
          <li>Store credentials using appropriate secure storage mechanisms.</li>
          <li>Use environment variables, secret-management systems, or equivalent secure mechanisms where appropriate.</li>
          <li>Restrict access to API Credentials to authorized personnel and systems.</li>
          <li>Immediately rotate or revoke compromised credentials.</li>
          <li>Notify [Platform Name] promptly if credentials are lost, stolen, exposed, or suspected of unauthorized use.</li>
        </ul>
        <p className="text-base leading-relaxed text-black">
          Merchants must not:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2 text-base text-black">
          <li>Publish API Credentials in source code repositories.</li>
          <li>Include secret credentials in publicly accessible applications.</li>
          <li>Share API Credentials through unsecured communication channels.</li>
          <li>Give API Credentials to unauthorized persons.</li>
          <li>Use another merchant&apos;s API Credentials.</li>
          <li>Attempt to bypass authentication or security controls.</li>
        </ul>
        <p className="text-base leading-relaxed text-black">
          The Merchant is responsible for activity performed using its API Credentials unless the activity is proven to have resulted from a security incident outside the Merchant&apos;s reasonable control and the Merchant has promptly notified the Platform.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">5. API Integration Requirements</h3>
        <p className="text-base leading-relaxed text-black">
          Merchants must implement the Trite’s API according to the current API documentation and technical specifications.
        </p>
        <p className="text-base leading-relaxed text-black">
          Integrations should:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2 text-base text-black">
          <li>Use supported API endpoints and authentication methods.</li>
          <li>Validate API responses appropriately.</li>
          <li>Handle errors and failed requests correctly.</li>
          <li>Implement appropriate timeout and retry mechanisms.</li>
          <li>Prevent duplicate payment submissions.</li>
          <li>Properly process transaction status changes.</li>
          <li>Maintain accurate transaction records.</li>
          <li>Correctly handle asynchronous payment notifications.</li>
          <li>Validate webhook requests before processing them.</li>
          <li>Maintain compatibility with announced API versions.</li>
        </ul>
        <p className="text-base leading-relaxed text-black">
          Merchants must not rely on undocumented API behaviour, internal endpoints, or unsupported features.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">6. Payment Processing and Transaction Integrity</h3>
        <p className="text-base leading-relaxed text-black">
          Merchants are responsible for ensuring that payment requests submitted through their systems are accurate and authorized.
        </p>
        <p className="text-base leading-relaxed text-black">
          Merchants must not:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2 text-base text-black">
          <li>Submit fraudulent or unauthorized transactions.</li>
          <li>Manipulate transaction amounts, currencies, references, or customer information.</li>
          <li>Intentionally submit duplicate transactions.</li>
          <li>Attempt to circumvent transaction limits or Platform controls.</li>
          <li>Create transactions for activities not approved during onboarding.</li>
          <li>Misrepresent the nature of a transaction or business activity.</li>
          <li>Use Trite’s API to process transactions on behalf of another business without authorization.</li>
        </ul>
        <p className="text-base leading-relaxed text-black">
          Merchants must maintain sufficient records to reconcile transactions processed through the Platform.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">7. Idempotency and Duplicate Transactions</h3>
        <p className="text-base leading-relaxed text-black">
          Where theTrite provides idempotency functionality, Merchants must use idempotency keys appropriately for payment operations that may be retried.
        </p>
        <p className="text-base leading-relaxed text-black">
          A Merchant must design its integration to prevent accidental duplicate charges caused by: network failures, client-side retries, server-side retries, timeouts, duplicate customer requests, repeated webhook processing.
        </p>
        <p className="text-base leading-relaxed text-black">
          The Merchant is responsible for implementing appropriate transaction reconciliation procedures.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">8. Webhooks and Notifications</h3>
        <p className="text-base leading-relaxed text-black">
          The Platform may use webhooks to notify Merchants about payment events, including successful payments, failed transactions, refunds, reversals, disputes, settlements, and other account events.
        </p>
        <p className="text-base leading-relaxed text-black">
          Merchants must:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2 text-base text-black">
          <li>Provide a secure webhook endpoint.</li>
          <li>Verify webhook authenticity using the security mechanisms provided by the Platform.</li>
          <li>Return appropriate HTTP responses.</li>
          <li>Process webhook events safely.</li>
          <li>Support duplicate webhook delivery where applicable.</li>
          <li>Avoid assuming that webhook events will always arrive exactly once or in a particular order.</li>
          <li>Maintain appropriate logs for webhook processing.</li>
        </ul>
        <p className="text-base leading-relaxed text-black">
          Merchants should use the transaction-status API or other official reconciliation mechanisms where necessary to confirm the final status of a transaction.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">9. Data Protection and Privacy</h3>
        <p className="text-base leading-relaxed text-black">
          Merchants are responsible for handling customer and payment-related information in accordance with applicable data-protection requirements.
        </p>
        <p className="text-base leading-relaxed text-black">
          Where applicable, Merchants must comply with relevant data-protection requirements, including requirements concerning consent, lawful processing, security, cross-border transfers, and data-subject rights.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">10. Payment Card and Sensitive Payment Information</h3>
        <p className="text-base leading-relaxed text-black">
          Merchants must not store, transmit, or process sensitive payment information through systems or methods that are not authorized by the Platform.
        </p>
        <p className="text-base leading-relaxed text-black">
          Where card payments are supported, the Merchant must comply with applicable payment-card security requirements, including the applicable requirements of the Payment Card Industry Data Security Standard (PCI DSS), where applicable.
        </p>
        <p className="text-base leading-relaxed text-black">
          Merchants must never request or store customer PINs, passwords, authentication codes, private keys, or other confidential authentication information unless expressly authorized and technically supported by the Platform.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">11. API Rate Limits and Fair Usage</h3>
        <p className="text-base leading-relaxed text-black">
          Trite may impose API rate limits, request quotas, concurrency limits, transaction limits, or other technical restrictions.
        </p>
        <p className="text-base leading-relaxed text-black">
          Merchants must respect all published or communicated limits. Merchants must not attempt to: circumvent rate limits, generate excessive or unnecessary API traffic, use automated processes to overload Platform infrastructure, deliberately cause service degradation, or distribute requests across multiple accounts or credentials to evade limits.
        </p>
        <p className="text-base leading-relaxed text-black">
          Trite may temporarily restrict or throttle API access where traffic creates a risk to Platform availability, security, or other users.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">12. Prohibited Activities</h3>
        <p className="text-base leading-relaxed text-black">
          Trite must not be used for illegal, fraudulent, deceptive, abusive, or unauthorized activities.
        </p>
        <p className="text-base leading-relaxed text-black">
          Prohibited activities may include, but are not limited to:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2 text-base text-black">
          <li>Money laundering or terrorist financing.</li>
          <li>Fraud or attempted fraud.</li>
          <li>Unauthorized financial transactions.</li>
          <li>Identity theft.</li>
          <li>Phishing or impersonation.</li>
          <li>Sale of illegal goods or services.</li>
          <li>Unauthorized gambling or other regulated activities.</li>
          <li>Transactions involving prohibited goods or services.</li>
          <li>Processing payments for undisclosed third parties.</li>
          <li>Circumventing applicable sanctions or regulatory restrictions.</li>
          <li>Using the Platform to facilitate criminal activity.</li>
          <li>Creating multiple accounts to evade Platform restrictions.</li>
          <li>Attempting to compromise Platform systems or security.</li>
          <li>Reverse engineering or unauthorized access to Platform infrastructure.</li>
        </ul>
        <p className="text-base leading-relaxed text-black">
          Trite may maintain a separate Restricted or Prohibited Business Policy that provides additional requirements and restrictions.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">13. Security Testing and Responsible Use</h3>
        <p className="text-base leading-relaxed text-black">
          Merchants must not conduct penetration testing, vulnerability scanning, load testing, denial-of-service testing, or other security testing against Platform infrastructure without prior written authorization.
        </p>
        <p className="text-base leading-relaxed text-black">
          Merchants must not: attempt to gain unauthorized access to Platform systems; probe or scan Platform infrastructure without authorization; exploit vulnerabilities; interfere with another Merchant&apos;s account or transactions; circumvent authentication or authorization controls; or reverse engineer Platform security mechanisms.
        </p>
        <p className="text-base leading-relaxed text-black">
          Suspected security vulnerabilities should be reported promptly through the Platform&apos;s designated security-reporting channel.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">14. Software Development and Third-Party Developers</h3>
        <p className="text-base leading-relaxed text-black">
          A Merchant may use employees, contractors, software developers, technology providers, or other authorized third parties to develop its integration. However, the Merchant remains responsible for: the security of its API Credentials; the activities of authorized developers; compliance with this Policy; the security and reliability of its integration; and transactions initiated through its account. The Merchant must ensure that third-party developers receive only the access necessary to perform their duties.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">15. Production Deployment</h3>
        <p className="text-base leading-relaxed text-black">
          Before activating a production integration, Merchants should verify: authentication is correctly implemented; API Credentials are securely stored; payment amounts and currencies are correctly handled; duplicate payment prevention is implemented; webhook verification is implemented; error handling is implemented; transaction reconciliation procedures are available; refund and reversal processes are properly implemented where applicable; customer-facing payment information is accurate; logging and monitoring are operational; and appropriate security controls are in place.
        </p>
        <p className="text-base leading-relaxed text-black">
          The Merchant is responsible for monitoring its integration after deployment.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">16. Monitoring and Logging</h3>
        <p className="text-base leading-relaxed text-black">
          Merchants should maintain appropriate logs for API requests, responses, payment events, errors, and webhook processing. Logs must not unnecessarily contain sensitive information such as: API secrets, authentication tokens, passwords, PINs, private keys, or sensitive payment credentials. The Merchant should maintain sufficient records to investigate failed transactions, disputes, security incidents, and reconciliation issues.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">17. API Versioning and Changes</h3>
        <p className="text-base leading-relaxed text-black">
          Trite may update, improve, modify, deprecate, or discontinue API functionality. Where reasonably practicable, Trite may provide notice of material changes that require Merchant action. Merchants are responsible for keeping their integrations compatible with supported API versions. Trite may discontinue unsupported or deprecated API versions after the applicable deprecation period. Merchants should regularly review API documentation, technical notices, and communications from the Platform.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">18. Service Availability</h3>
        <p className="text-base leading-relaxed text-black">
          Trite will use reasonable efforts to maintain API availability and reliability but does not guarantee uninterrupted or error-free service. API availability may be affected by scheduled maintenance, emergency maintenance, security incidents, infrastructure failures, third-party service interruptions, internet or telecommunications failures, or events beyond the Platform&apos;s reasonable control. Merchants should design integrations with appropriate timeout, retry, fallback, and reconciliation mechanisms.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">19. Security Incidents</h3>
        <p className="text-base leading-relaxed text-black">
          If a Merchant becomes aware of: unauthorized access to its account; compromised API Credentials; suspicious transactions; data exposure; security vulnerabilities; unauthorized API activity; or a suspected breach affecting Platform or customer data, the Merchant must promptly notify Trite through the designated support or security channel. The Merchant must cooperate with reasonable requests relating to investigation, containment, remediation, and prevention of further incidents.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">20. Merchant Responsibility</h3>
        <p className="text-base leading-relaxed text-black">
          The Merchant is solely responsible for: its application and infrastructure; its customers and users; transactions initiated through its systems; the accuracy of transaction information; its API integration; compliance with applicable laws; security of its systems and credentials; customer support relating to its products and services; and refunds, cancellations, and other obligations applicable to its business. API access does not make Trite responsible for the Merchant&apos;s products, services, website, application, employees, contractors, or customers.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">21. Audit and Compliance</h3>
        <p className="text-base leading-relaxed text-black">
          Trite may monitor API usage and account activity for security, fraud prevention, compliance, operational, and risk-management purposes. Trite may request information or documentation from a Merchant where necessary to: verify business activities; investigate transactions; meet legal or regulatory obligations; address security concerns; investigate suspected fraud or abuse; or confirm compliance with Platform policies. Merchants must provide accurate information and cooperate with reasonable compliance requests.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">22. Suspension and Termination of API Access</h3>
        <p className="text-base leading-relaxed text-black">
          Trite may suspend, restrict, or terminate API access where it reasonably believes that: the Merchant has violated this Policy; the Merchant has violated applicable law; fraud or suspicious activity has been detected; API usage presents a security or operational risk; the Merchant&apos;s account has been compromised; the Merchant has provided materially inaccurate information; the Merchant is using the Platform for prohibited activities; or continued access may expose the Platform, customers, or other users to risk. Where appropriate, the Platform may provide notice before taking action. However, immediate suspension may occur where necessary to protect customers, funds, systems, or the integrity of the Platform.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">23. Changes to This Policy</h3>
        <p className="text-base leading-relaxed text-black">
          Trite may update this Policy from time to time to reflect changes in: laws and regulations; security requirements; payment industry standards; API functionality; Platform services; or business or operational requirements. Updated versions may be published through Trite or communicated to affected Merchants. Continued use of the API after the effective date of an updated Policy constitutes acceptance of the revised Policy, to the extent permitted by applicable law.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">24. Merchant Acceptance</h3>
        <p className="text-base leading-relaxed text-black">
          Before receiving production API access, the Merchant confirms that: it has read and understood this API Development &amp; Integration Policy; it will comply with this Policy; it will comply with applicable laws and regulations; it will protect API Credentials and customer information; it will use the API only for legitimate and authorized business purposes; and it understands that violation of this Policy may result in suspension or termination of API access.
        </p>
        <p className="text-base leading-relaxed text-black">
          <strong>Merchant Acceptance Statement</strong><br />
          By checking the acceptance box below, I confirm that I am authorized to act on behalf of the business and that the business agrees to comply with this API Development &amp; Integration Policy and the Platform&apos;s applicable Terms, Privacy Policy, and other policies.
        </p>
        <p className="text-base leading-relaxed text-black">
          ☐ I have read and agree to the Merchant API Development &amp; Integration Policy.<br />
          Merchant/Business Name: __________________________<br />
          Authorized Representative: ________________________<br />
          Email Address: ___________________________________<br />
          Date: ___________________________________________<br />
          Signature/Authorization: __________________________
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">25. Contact</h3>
        <p className="text-base leading-relaxed text-black">
          For API development, technical support, security incidents, or integration questions, contact:<br />
          Developer Support: developer@trite.tech<br />
          Developer Documentation: [Insert Documentation URL]
        </p>
      </div>
    </div>
  );
}

