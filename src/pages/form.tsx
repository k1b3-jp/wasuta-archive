import Script from 'next/script';
import DefaultLayout from '../app/layout';

export default function Form() {
  return (
    <>
      <DefaultLayout>
        <div className="py-4 px-8">
          <Script async src="https://sdk.form.run/js/v2/embed.js"></Script>
          <div
            className="formrun-embed"
            data-formrun-form="@wasuta-archive"
            data-formrun-redirect="true"
          ></div>
        </div>
      </DefaultLayout>
    </>
  );
}
