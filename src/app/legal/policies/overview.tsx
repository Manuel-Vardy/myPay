import React from "react";

export function OverviewContent() {
  return (
    <div className="space-y-6 text-black">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-black">Overview</h2>
      <p className="text-base leading-relaxed text-black">
        This page provides answers to the most frequently asked questions about Trite. In case you don&apos;t find what you&apos;re looking for, feel free to leave a message, or call +233 (0) 202-295-858 for assistance.
      </p>

      <ul className="list-disc list-inside space-y-1 pl-2 text-base text-black">
        <li>Why did my payment fail?</li>
        <li>How can I cancel a payment?</li>
        <li>How long does it take for a payment to reflect?</li>
        <li>How do I know that my bill has been paid?</li>
        <li>What can I use to pay?</li>
        <li>When can I pay?</li>
        <li>Why do you need my full name, email address and phone number?</li>
        <li>How can I make a suggestion?</li>
        <li>How should I submit an issue?</li>
        <li>Is Trite safe?</li>
        <li>How safe and secure are the passwords I store in Trite?</li>
        <li>Will Trite ever share or sell my information?</li>
        <li>Why do I need to share my ID?</li>
        <li>Why is there a limit on my account?</li>
      </ul>

      <div className="space-y-6 pt-4 text-black">
        <div className="space-y-2 text-black">
          <h3 className="text-lg font-bold text-black">Q1 of 14: Why did my payment fail?</h3>
          <p className="text-base leading-relaxed text-black">
            Most payment failures are caused by one of the following reasons:
          </p>
          <p className="text-base leading-relaxed text-black">
            Non-sufficient Funds (NSF) this is similar to a &quot;bounced check.&quot; This happens when you try to pay more than is available in your bank account. Please note that while Trite doesn&apos;t charge you for NSF, your bank may. Please refer to your bank for details.
          </p>
          <p className="text-base leading-relaxed text-black">
            Your bank did not authorize this specific payment. This may happen the first time you use the service. Once you authorize your bank, you should be able to transact.
          </p>
          <p className="text-base leading-relaxed text-black">
            Your biller refused the payment. Trite will let you know if this is the case and you can contact your biller for more information.
          </p>
          <p className="text-base leading-relaxed text-black">
            To protect you from accidental double-payments, Trite may reject identical payments (same amount to the same biller) made immediately after each other.
          </p>
        </div>

        <div className="space-y-2 text-black">
          <h3 className="text-lg font-bold text-black">Q2 of 14: How can I cancel a payment?</h3>
          <p className="text-base leading-relaxed text-black">
            Payments are processed instantly and are final. Please refer to our refund policy if warranted.
          </p>
        </div>

        <div className="space-y-2 text-black">
          <h3 className="text-lg font-bold text-black">Q3 of 14: How long does it take for a payment to reflect?</h3>
          <p className="text-base leading-relaxed text-black">
            Once you submit a payment, Trite verifies your payment authorization with your bank and then securely submits it to the biller. Most payments are reflected instantly on your account and we will keep you updated on the status of all pending payments.
          </p>
        </div>

        <div className="space-y-2 text-black">
          <h3 className="text-lg font-bold text-black">Q4 of 14: How do I know that my bill has been paid?</h3>
          <p className="text-base leading-relaxed text-black">
            After you make a payment, Trite will email you a receipt. You can also check payment status by reviewing your transaction history under &quot;My Account&quot; when logged in. You can also contact us at support@Trite.com or via phone with your payment reference ID (available on the receipt displayed when you complete bill payment, and on the receipt you receive by email) if you require assistance.
          </p>
        </div>

        <div className="space-y-2 text-black">
          <h3 className="text-lg font-bold text-black">Q5 of 14: What can I use to pay?</h3>
          <p className="text-base leading-relaxed text-black">
            You can use your debit, credit card, bank or other payment account to make payments with Trite.
          </p>
        </div>

        <div className="space-y-2 text-black">
          <h3 className="text-lg font-bold text-black">Q6 of 14: When can I pay?</h3>
          <p className="text-base leading-relaxed text-black">
            You can pay at any time. As soon as your payment is reflected, your merchant account will be credited appropriately.
          </p>
        </div>

        <div className="space-y-2 text-black">
          <h3 className="text-lg font-bold text-black">Q7 of 14: Why do you need my full name, email address and phone number?</h3>
          <p className="text-base leading-relaxed text-black">
            Before you can use Trite to make payments, we need to confirm your identity. We protect this information with bank-level security and will never sell your personal information.
          </p>
        </div>

        <div className="space-y-2 text-black">
          <h3 className="text-lg font-bold text-black">Q8 of 14: How can I make a suggestion?</h3>
          <p className="text-base leading-relaxed text-black">
            Send an email message to support@trite.tech. At Trite, we strive to constantly improve our service, and we welcome all user feedback.
          </p>
        </div>

        <div className="space-y-2 text-black">
          <h3 className="text-lg font-bold text-black">Q9 of 14: How should I submit an issue?</h3>
          <p className="text-base leading-relaxed text-black">
            If you are encountering any issues, kindly email support@trite.tech.
          </p>
        </div>

        <div className="space-y-2 text-black">
          <h3 className="text-lg font-bold text-black">Q10 of 14: Is Trite safe?</h3>
          <p className="text-base leading-relaxed text-black">
            Yes, Trite is safe. We do not have access to any of your personal information, usernames or passwords. We also do not have access to your bank account. We simply serve as the platform for you to access your accounts. Trite adheres to the highest standards in security in order to keep your data private and secure. All your data is protected with a 256-bit encryption level, and the data exchanged with Trite is secured using SSL in order to create a highly secure connection between users and Trite&apos;s servers. We work to bring you a great service, with the peace of mind that your information will be protected.
          </p>
        </div>

        <div className="space-y-2 text-black">
          <h3 className="text-lg font-bold text-black">Q11 of 14: How safe and secure are the passwords I store in Trite?</h3>
          <p className="text-base leading-relaxed text-black">
            All credential information is highly encrypted and remains in a closed system, which means no one, including our own employees, can decrypt the password. Trite has the ability to save a password or delete it, but we can never read one.
          </p>
        </div>

        <div className="space-y-2 text-black">
          <h3 className="text-lg font-bold text-black">Q12 of 14: Will Trite ever share or sell my information?</h3>
          <p className="text-base leading-relaxed text-black">
            Your privacy is not for sale: Trite will NEVER (now or in the future) share any personally identifiable information we collect from our users with any 3rd party.
          </p>
        </div>

        <div className="space-y-2 text-black">
          <h3 className="text-lg font-bold text-black">Q13 of 14: Why do I need to share my ID?</h3>
          <p className="text-base leading-relaxed text-black">
            ID verification is required to confirm the identity of the individual making transactions on the Trite platform.
          </p>
        </div>

        <div className="space-y-2 text-black">
          <h3 className="text-lg font-bold text-black">Q14 of 14: Why is there a limit on my account?</h3>
          <p className="text-base leading-relaxed text-black">
            Due to BoGs regulations, each account has a set number of transactions that can be performed daily. However, at your request, that limit can be increased after the required verification process has been completed.
          </p>
        </div>
      </div>
    </div>
  );
}

