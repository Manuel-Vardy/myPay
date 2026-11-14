import React from "react";

export function InformationSecurityPolicyContent() {
  return (
    <div className="space-y-6 text-black">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-black">
        INFORMATION SECURITY POLICY
      </h2>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">Introduction</h3>
        <p className="text-base leading-relaxed text-black">
          This policy defines the overall framework of information security policies that have been developed and adopted within Trite’s Information Security Management System.
        </p>
        <p className="text-base leading-relaxed text-black">
          Trite has decided to subscribe to and adopt ISO/IEC 27001(Information Security Management System) so that the effective adoption of information security best practice may be validated by an external third party.
        </p>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">Products and Services</h3>
        <p className="text-base leading-relaxed text-black">
          The following products and services are within the scope of the ISMS:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2 text-base text-black">
          <li>Trite app (Android and iOS)</li>
          <li>Trite POS app (Android, iOS, Windows and USSD)</li>
          <li>Producer Portal</li>
          <li>Web checkout</li>
          <li>Messaging</li>
          <li>Direct APIs for businesses</li>
        </ul>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">Information Security Objectives</h3>
        <p className="text-base leading-relaxed text-black">
          Based on the requirements and factors set out in this document, the following major objectives are set for information security:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-base text-black">
          <li>Improve organizational information security awareness and training culture by 95%</li>
          <li>Increase the protection of confidential information of all clients/customers by 95%</li>
          <li>Ensure the Protection of all critical information assets and business processes by 95%</li>
          <li>Ensure 100% compliance with information security regulations and laws</li>
        </ul>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">Top Management Leadership and Commitment</h3>
        <p className="text-base leading-relaxed text-black">
          Commitment to information security extends to senior levels of the organization and will be demonstrated through this ISMS Policy and the provision of appropriate resources to provide and develop the ISMS and associated controls.
        </p>
        <p className="text-base leading-relaxed text-black">
          Top management will also ensure that a systematic review of performance of the programme is conducted on a regular basis to ensure that quality objectives are being met and quality issues are identified through internal and external audit programmes and management processes.
        </p>
        <p className="text-base leading-relaxed text-black">
          The Information Security Manager shall have overall authority and responsibility for the implementation and management of the Information Security Management System, specifically:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2 text-base text-black">
          <li>The identification, documentation and fulfilment of information security requirements</li>
          <li>Implementation, management and improvement of risk management processes</li>
          <li>Integration of security in all processes</li>
          <li>Compliance with statutory, regulatory and contractual requirements</li>
          <li>Reporting to top management on performance and improvement</li>
        </ul>
      </div>

      <div className="space-y-3 text-black">
        <h3 className="text-xl font-bold text-black">Continual Improvement Policy</h3>
        <p className="text-base leading-relaxed text-black">
          Trite’s top management is committed to continually improving the ISMS in the bid to comply with regulatory requirements, international standards and best practices.
        </p>
        <p className="text-base leading-relaxed text-black">
          Trite&apos;s policy regarding Continual Improvement is to:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2 text-base text-black">
          <li>Continually improve the effectiveness of the ISMS</li>
          <li>Enhance current processes to bring them into line with good practice as defined within ISO/IEC 27001 standards.</li>
          <li>Maintain ISO/IEC 27001 certification on an ongoing basis</li>
          <li>Increase the level of proactivity regarding information security</li>
          <li>Make information security processes and controls more measurable in order to provide a sound basis for informed decisions</li>
          <li>Review relevant metrics on an annual basis to assess whether it is appropriate to change them, based on collected historical data</li>
          <li>Obtain ideas for improvement via regular meetings with stakeholders and document them in a Continual Improvement Plan</li>
          <li>Review the Continual Improvement Plan at least once in a year in the ISMS Management Review Meetings (IMRM) in order to prioritise and assess timescales and benefits</li>
        </ul>
        <p className="text-base leading-relaxed text-black">
          Ideas for improvements may be obtained from any source including employees, customers, suppliers, risk assessments and service reports. Once identified, they will be added to the Continual Improvement Plan and evaluated by the Information Security Committee for Continual Improvement.
        </p>
        <p className="text-base leading-relaxed text-black">
          You can always share your information security ideas and concerns with us via admin@Trite.tech
        </p>
      </div>
    </div>
  );
}

