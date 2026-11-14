import React from "react";

export function ChargeBackContent() {
  return (
    <div className="space-y-6 text-black">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-black">CHARGE BACK</h2>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">What is a Chargeback?</h3>
        <p className="text-base leading-relaxed text-black">
          A chargeback is a reversal of a credit card transaction by your bank. Chargebacks are usually initiated when fraudulent purchases are made on a person’s credit card. You can initiate such a request if you find a charge on your account that you did not authorize, or a charge for an item that you did not receive. If you need to request a chargeback, please contact us first so we can help you resolve the issue. In most cases, our refund policy is the appropriate route to take instead of a chargeback request.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">How does Trite handle Chargebacks?</h3>
        <p className="text-base leading-relaxed text-black">
          When Trite receives a chargeback notice, the account from which the service was purchased is immediately blocked, and all associated services in the account are suspended. Without additional information, our policy is to treat chargebacks as a result of fraudulent activity. As a result, Trite will suspend your account and send you an email and/or text notification, requesting that you contact us to resolve the issue and reactivate your Trite account. Trite will evaluate all chargeback requests. If deemed fraudulent, the case will be turned over to the appropriate law enforcement agencies.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">How do I cancel a Chargeback?</h3>
        <p className="text-base leading-relaxed text-black">
          To undo a chargeback, you must contact your bank to issue a chargeback reversal. Please contact Trite to inform us when the reversal is initiated so we can make a note on your account.
        </p>
      </div>
    </div>
  );
}

