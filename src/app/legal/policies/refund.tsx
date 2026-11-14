import React from "react";

export function RefundPolicyContent() {
  return (
    <div className="space-y-6 text-black">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-black">REFUND POLICY</h2>
      <p className="text-base leading-relaxed text-black">
        This policy outlines the terms and procedures for requesting refunds on Trite’s services.
      </p>
      <p className="text-base leading-relaxed text-black">
        Trite retains the right to discontinue this Refund Policy for any customer whom Trite determines, in its sole discretion, has misrepresented the reason for demanding a refund.
      </p>
      <p className="text-base leading-relaxed text-black">
        Refunds will be offered if:
      </p>
      <ul className="list-disc list-inside space-y-1.5 pl-2 text-base text-black">
        <li>The customer’s account is debited twice for the same transaction.</li>
        <li>There is a payment processing error.</li>
        <li>Trite is unable to provide the service requested.</li>
        <li>The customer issues multiple payment instructions for the same transaction or pays twice for the same transaction.</li>
        <li>Payment dispute is investigated and closed.</li>
      </ul>
      <p className="text-base leading-relaxed text-black">
        Where required by law, refunds associated with certain transactions may be eligible for different considerations.
      </p>
      <p className="text-base leading-relaxed text-black">
        Trite will not be liable for any damages whatsoever resulting from a wrong transaction.
      </p>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">Right to Refund</h3>
        <p className="text-base leading-relaxed text-black">
          Customers/Merchants can initiate a request for refunds for wrong or unfulfilled service payments by:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-base text-black">
          <li>Calling 0202949585/ 0592 992 605</li>
          <li>Sending an email to support@trite.tech</li>
          <li>In writing via social media: WhatsApp: 0202949585</li>
          <li>In writing, via post – P.O. Box 11667 SE Suame -Ghana</li>
        </ul>
        <p className="text-base leading-relaxed text-black">
          When requesting a refund, customers/merchants should be willing to share details of the payments to assist in refund review and approval.
        </p>
        <p className="text-base leading-relaxed text-black">
          All refund requests will be dealt with high priority, and once reviewed and approved, will be returned to the source of payment (eg., Mobile money wallet, or bank card or your Trite wallet where applicable)
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">Additional Rights</h3>
        <p className="text-base leading-relaxed text-black">
          Trite’s refund policy does not infringe on your rights to contest the decisions of your refund request by Trite through your payment Network refund/chargeback process.
        </p>
        <p className="text-base leading-relaxed text-black">
          Trite is fully compliant with each of the payment Network policies. It should be noted, however, that by using Trite you are subject to the terms and conditions of our service.
        </p>
      </div>
    </div>
  );
}

