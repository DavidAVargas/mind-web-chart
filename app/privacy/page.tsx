import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/legal-page";
import { APP_NAME, CONTACT_EMAIL } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${APP_NAME} handles your account and your charts.`,
};

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="October 27, 2026"
      intro={
        <>
          What you put in {APP_NAME} is often personal: goals, worries, the
          things holding you back. This page explains, in plain words, what we
          collect, why, and how to get it removed. The short version: your
          charts are yours, we don’t sell your data, and there are no ads.
        </>
      }
    >
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Your account.</strong> Your name, email address and profile
          picture (if you sign in with a service like Google), plus sign-in
          activity that keeps your account secure.
        </li>
        <li>
          <strong>Your charts.</strong> Everything you put in a chart: bubbles,
          notes, threads, emoji, and when the chart was created and edited.
        </li>
        <li>
          <strong>Basic technical data.</strong> Like most websites, our
          hosting keeps short-lived logs (such as IP address and browser type)
          to run the service and protect it from abuse.
        </li>
        <li>
          <strong>Settings in your browser.</strong> Your light or dark theme
          choice is stored on your device, not on our servers.
        </li>
      </ul>
      <p>
        We don’t use advertising, ad trackers or analytics that follow you
        around the web.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To sign you in and save your charts so they’re there next time.</li>
        <li>To apply your plan, for example the free plan’s chart limit.</li>
        <li>To keep the service secure, fix problems and answer your emails.</li>
      </ul>
      <p>
        We don’t read your charts. People who run {APP_NAME} only access
        them when it’s needed to keep the service working, to fix a
        problem you’ve asked us to look at, or when the law requires it.
      </p>

      <h2>Who else handles your data</h2>
      <p>
        We use a few trusted services to run {APP_NAME}. They only process your
        data to provide their service to us:
      </p>
      <ul>
        <li>
          <strong>Clerk</strong>: accounts and sign-in.
        </li>
        <li>
          <strong>Neon</strong>: the database where your charts are saved.
        </li>
        <li>
          <strong>Vercel</strong>: hosting for the website and app.
        </li>
      </ul>
      <p>
        If we add paid plans or new features that involve another service, such
        as a payment provider, we’ll update this page first. We never sell
        your personal information.
      </p>

      <h2>Keeping it safe</h2>
      <p>
        Everything travels over an encrypted connection (HTTPS), and our
        providers encrypt stored data. Only you can open your charts from your
        account. No method is perfect, but we work to protect your data and
        will tell you if something goes wrong that affects it.
      </p>

      <h2>How long we keep it, and deleting it</h2>
      <ul>
        <li>
          <strong>A chart:</strong> delete it from your charts page and it’s
          removed from our database. Copies in our provider’s backups are
          cleared on their normal schedule.
        </li>
        <li>
          <strong>Everything:</strong> email {mail} from the address on your
          account and we’ll delete your account and all of your charts
          within 30 days.
        </li>
      </ul>

      <h2>Your choices and rights</h2>
      <p>You can, at any time:</p>
      <ul>
        <li>see and edit your charts and account details in the app;</li>
        <li>download any chart with <em>Export backup</em>;</li>
        <li>ask us what data we hold about you, or to correct or delete it.</li>
      </ul>
      <p>
        Depending on where you live (for example California or the EU), you may
        have more rights under local law. Email {mail} and we’ll help.
      </p>

      <h2>Children</h2>
      <p>
        {APP_NAME} isn’t meant for children under 13, and we don’t
        knowingly collect their data. If you think a child has made an
        account, let us know and we’ll delete it.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If we change how we handle your data, we’ll update this page and
        the date at the top. For big changes, we’ll let you know in the
        app or by email.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about your privacy? Email {mail}. See also our{" "}
        <Link href="/terms">terms of service</Link>.
      </p>
    </LegalPage>
  );
}
