import { Form, useNavigation, useSearchParams } from 'react-router';
import styles from './ContactForm.module.css';

export type ContactFormResult =
  | { ok: true }
  | {
      ok: false;
      errors: Record<string, string>;
      formError: string | null;
      /** Only sent when delivery actually failed — see contactMailto(). */
      mailto: string | null;
    };

export type ServiceChoice = { _id: string; title: string; slug: string | null };

export default function ContactForm({
  services,
  result,
  privacyNote,
}: {
  services: ServiceChoice[];
  result: ContactFormResult | undefined;
  /** Brand-authored reassurance shown under the form; hidden when unset. */
  privacyNote?: string | null;
}) {
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const submitting = navigation.state === 'submitting';

  // Service cards link here as ?service=<slug>, so the dropdown arrives
  // pre-selected with whatever the visitor clicked.
  const preselected = searchParams.get('service');
  const preselectedId =
    services.find((s) => s.slug === preselected || s._id === preselected)?._id ?? '';

  if (result?.ok) {
    return (
      <div className={styles.success}>
        <h3 className={styles.successHeading}>Message sent.</h3>
        <p style={{ margin: 0 }}>
          Thanks — it landed. I read everything that comes in and will get back to you,
          usually within a couple of days.
        </p>
      </div>
    );
  }

  const errors = result?.ok === false ? result.errors : {};
  const formError = result?.ok === false ? result.formError : null;
  // Present only on a delivery failure, so the address never reaches a visitor
  // (or a scraper) who simply loaded the page.
  const mailto = result?.ok === false ? result.mailto : null;

  return (
    <Form method="post" className={styles.form} replace>
      {formError && (
        <p className={styles.formError}>
          {formError}{' '}
          {mailto && <a href={mailto}>Email me directly instead</a>} and nothing gets lost.
        </p>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="name">
          Name
        </label>
        <input
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <span className={styles.error} id="name-error">
            {errors.name}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">
          Email
        </label>
        <input
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span className={styles.error} id="email-error">
            {errors.email}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="company">
          Company <span className={styles.optional}>(optional)</span>
        </label>
        <input
          className={styles.input}
          id="company"
          name="company"
          type="text"
          autoComplete="organization"
        />
      </div>

      {services.length > 0 && (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="service">
            What about? <span className={styles.optional}>(optional)</span>
          </label>
          <select
            className={styles.select}
            id="service"
            name="service"
            defaultValue={preselectedId}
          >
            <option value="">Not sure yet / something else</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="budget">
          Budget <span className={styles.optional}>(optional)</span>
        </label>
        <input
          className={styles.input}
          id="budget"
          name="budget"
          type="text"
          placeholder="A range is fine"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="timeline">
          Timeline <span className={styles.optional}>(optional)</span>
        </label>
        <input
          className={styles.input}
          id="timeline"
          name="timeline"
          type="text"
          placeholder="When do you need it?"
        />
      </div>

      <div className={`${styles.field} ${styles.fieldWide}`}>
        <label className={styles.label} htmlFor="message">
          What do you need?
        </label>
        <textarea
          className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
          id="message"
          name="message"
          required
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <span className={styles.error} id="message-error">
            {errors.message}
          </span>
        )}
      </div>

      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.actions}>
        <button className={styles.submit} type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send enquiry'}
        </button>
        <span className={styles.optional} style={{ fontSize: '0.85rem' }}>
          {/* or <a href={mailto} style={{ color: 'var(--color-mustard)' }}>email me</a> */}
        </span>
      </div>

      {privacyNote && <p className={styles.privacy}>{privacyNote}</p>}
    </Form>
  );
}
