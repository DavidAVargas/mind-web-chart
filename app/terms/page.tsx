import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/legal-page";
import { APP_NAME, CONTACT_EMAIL } from "@/lib/brand";
import { FREE_CHART_LIMIT } from "@/lib/mind-map/chart-meta";

export const metadata: Metadata = {
  title: "Terms of service",
  description: `The rules for using ${APP_NAME}.`,
};

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      updated="October 27, 2026"
      intro={
        <>
          These terms are the agreement between you and {APP_NAME} when you use
          the website and app. We’ve kept them short and readable. By
          creating an account or using {APP_NAME}, you agree to them.
        </>
      }
    >
      <h2>Your account</h2>
      <ul>
        <li>You need an account to use {APP_NAME}, and you must be at least 13.</li>
        <li>
          Keep your sign-in details safe. You’re responsible for what
          happens in your account.
        </li>
        <li>Give accurate details, and one person per account.</li>
      </ul>

      <h2>Your charts belong to you</h2>
      <p>
        You own everything you put in {APP_NAME}. You give us permission to
        store, copy and display your charts only so we can run the service for
        you: saving them, showing them back to you, and keeping backups. We
        don’t claim ownership and don’t use your charts for anything
        else.
      </p>

      <h2>Using {APP_NAME} fairly</h2>
      <p>Please don’t:</p>
      <ul>
        <li>break the law or use {APP_NAME} to harm others;</li>
        <li>try to get into other people’s accounts or charts;</li>
        <li>
          overload, attack, scrape or reverse-engineer the service, or get
          around plan limits;
        </li>
        <li>store content you don’t have the right to use.</li>
      </ul>
      <p>
        We may suspend or close accounts that break these rules, and will tell
        you why when we can.
      </p>

      <h2>Plans and payment</h2>
      <p>
        The free plan includes {FREE_CHART_LIMIT} chart and doesn’t
        include AI features. Paid plans may be offered later. If they are,
        we’ll show the price and what’s included before you pay, and
        purchases made through the Apple App Store or Google Play also follow
        their rules for billing and refunds. We may change plans and limits
        over time, and won’t remove charts you’ve already made because
        of a change.
      </p>

      <h2>Not professional advice</h2>
      <p>
        {APP_NAME} is a tool for organizing your own thoughts. It isn’t
        therapy, medical, legal or financial advice, and it isn’t a
        substitute for a professional. If you’re in crisis or thinking
        about harming yourself, please contact local emergency services or a
        crisis line right away. In the US, you can call or text 988.
      </p>

      <h2>The service as it is</h2>
      <p>
        {APP_NAME} is new and growing. We work hard to keep it running and your
        charts safe, but it’s provided “as is,” without
        guarantees that it will always be available or free of errors. We
        recommend exporting backups of charts that matter to you. Features may
        change, and we may add or remove things as the product improves.
      </p>

      <h2>Limits on our liability</h2>
      <p>
        To the extent the law allows, {APP_NAME} isn’t liable for
        indirect or consequential losses, or for lost data, arising from your
        use of the service. Where liability can’t be excluded, it’s
        limited to the amount you paid us in the 12 months before the claim,
        or $50 if you haven’t paid anything. Nothing here limits rights
        you have under consumer protection laws that can’t be waived.
      </p>

      <h2>Leaving</h2>
      <p>
        You can stop using {APP_NAME} at any time. To delete your account and
        all your charts, email {mail}. See the{" "}
        <Link href="/privacy">privacy policy</Link> for how deletion works.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        If we change these terms, we’ll update this page and the date at
        the top, and let you know about significant changes. Continuing to use{" "}
        {APP_NAME} after a change means you accept the new terms.
      </p>

      <h2>Contact</h2>
      <p>Questions about these terms? Email {mail}.</p>
    </LegalPage>
  );
}
