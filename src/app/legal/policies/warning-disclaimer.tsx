import React from "react";

export function WarningDisclaimerContent() {
  return (
    <div className="space-y-6 text-black">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-black">
        WARNING DISCLAIMER NOTICE OF NON-LIABILITY FOR SHARING OTP
      </h2>
      <p className="text-base leading-relaxed text-black">
        This warning and disclaimer (the “Disclaimer”) is provided by Trite to inform all users of the Trite mobile and web applications (hereinafter referred to as “Users”) of the potential risks and consequences associated with sharing One-Time Passwords (OTP) with third parties.
      </p>
      <p className="text-base leading-relaxed text-black">
        By using the OTP provided by Trite, users acknowledge and agree to the following:
      </p>
      <div className="space-y-4 text-black">
        <p className="text-base leading-relaxed text-black">
          <strong>Sole Responsibility:</strong> Users understand and accept that the User is solely responsible for the safekeeping and confidentiality of any OTP issued by Trite via the mobile and web applications to the User in furtherance of completing a transaction. This includes not sharing the OTP with any third party, except as explicitly required for the intended purpose of the OTP.
        </p>
        <p className="text-base leading-relaxed text-black">
          <strong>Risk of Unauthorized Access:</strong> Sharing OTPs with third parties, intentionally or unintentionally, may result in unauthorized access to User sensitive accounts, User data, or services linked to the OTP.
        </p>
        <p className="text-base leading-relaxed text-black">
          <strong>Company’s Limited Liability:</strong> Trite will not be held liable for any losses, damages, or liabilities incurred by a User or any other party resulting from the sharing of OTPs with third parties. This includes, but is not limited to, financial losses, data breaches, or any other adverse consequences.
        </p>
        <p className="text-base leading-relaxed text-black">
          <strong>Unauthorized Transactions:</strong> The User understands that unauthorized transactions or actions taken with the OTP shared with third parties will not be considered the responsibility of Trite, and the User will bear full responsibility for such transactions.
        </p>
        <p className="text-base leading-relaxed text-black">
          <strong>Secure Communication:</strong> The User is responsible for ensuring that any communication involving the OTP remains private and is only utilized by the User for its intended purpose.
        </p>
        <p className="text-base leading-relaxed text-black">
          <strong>Reporting Unauthorized Access:</strong> In the event of unauthorized access, User must promptly report the incident to the Trite. Trite shall record such information in furtherance of updating its database in relation to suspicious and/or fraud-related activity and, where possible, to take appropriate action to safeguard accounts or data. The reporting of the incident to Trite by the User will not place any obligation on Trite to engage, refund or take any action in relation to the report save for what has expressly been provided above. Trite shall bear no liability in relation to the report shared by the User.
        </p>
      </div>
      <p className="text-base leading-relaxed text-black">
        By continuing to use the OTP provided by Trite, User acknowledges having read, understood, and agreed to the terms and conditions set forth in this Disclaimer. User further acknowledges that it is User’s responsibility to exercise caution and adhere to security best practices when handling OTPs.
      </p>
      <p className="text-base leading-relaxed text-black">
        Trite reserves the right to modify or amend this Disclaimer at any time without prior notice. It is the User&apos;s responsibility to review this Disclaimer periodically to ensure compliance with the most current terms and conditions.
      </p>
      <p className="text-base leading-relaxed text-black">
        Users&apos; use of the OTP provided by Trite constitutes acceptance of this Disclaimer and the terms contained herein.
      </p>
    </div>
  );
}

