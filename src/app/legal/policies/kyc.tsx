import React from "react";

export function KycPolicyContent() {
  return (
    <div className="space-y-6 text-black">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-black">KYC Policy</h2>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">Introduction</h3>
        <p className="text-base leading-relaxed text-black">
          Trite ensures that a proper Customer Due Diligence (CDD) framework is used to know the customers who use our payment services. This makes it possible for Trite to deal with legitimate customers and flag out criminally-minded customers from doing business with us.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">Scope and Objective:</h3>
        <p className="text-base leading-relaxed text-black">
          The objective of the KYC policy is to prevent the Company from being used, intentionally or unintentionally, by criminal elements for money laundering activities or terrorist financing activities.
        </p>
        <p className="text-base leading-relaxed text-black">
          Thus, the KYC policy has been framed by Trite for the following purposes:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-base text-black">
          <li>To prevent criminal elements from using the Company for money laundering or criminal activities;</li>
          <li>To enable the Company to know and understand its customers and their financial (Mobile Money/Card) transactions and dealings better, which, in turn, would help the Company to manage risks prudently;</li>
          <li>To put in place appropriate controls for detection and reporting of suspicious activities in accordance with applicable laws/laid down procedures.</li>
          <li>To comply with applicable payment laws and regulatory guidelines in Ghana.</li>
        </ul>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">Onboarding Process</h3>
        <p className="text-base leading-relaxed text-black">
          Trite has adopted the requirements below to help us know the kind of customer(s) we are dealing with at any point in time to ensure that we are transacting business with legitimate individuals and businesses.
        </p>
        <p className="text-base leading-relaxed text-black">
          <strong>Basic Requirements:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-base text-black">
          <li>Organization/business with something legit to sell.</li>
          <li>Items must be sellable through Trite.</li>
          <li>Organization/business must be the direct provider of the product or service (No agents)</li>
          <li>Individuals are required to provide valid and acceptable national identification cards to prove their true identity.</li>
        </ul>
        <p className="text-base leading-relaxed text-black pt-2">
          <strong>Specialized Business:</strong> Additional documents are required and inspected by Trite before onboarding businesses with specialized activities like betting and lottery. For instance, when onboarding a betting company, we will require additional documents such as a valid (unexpired) licence from the Gaming Commission and the National Lottery Authority.
        </p>
        <p className="text-base leading-relaxed text-black">
          <strong>Politically Exposed Persons:</strong> Trite’s Anti-Money Laundering Policy describes how people and Organizations that fall under this category are dealt with.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">Transaction Monitoring</h3>
        <p className="text-base leading-relaxed text-black">
          Customer transactions are regularly monitored by the Revenue Assurance Team to fish out unusual transactions. Customers are contacted for clarification, and if there is suspicion of illegal transactions, the necessary legal steps are taken to report such issues to the regulatory bodies for legal redress.
        </p>
        <p className="text-base leading-relaxed text-black">
          This is done to protect our customers and businesses that use the Trite from criminally minded people.
        </p>
        <p className="text-base leading-relaxed text-black">
          For more information and clarification about our KYC policy, please email support@trite.tech.
        </p>
      </div>
    </div>
  );
}

