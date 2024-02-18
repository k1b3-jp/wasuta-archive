import DefaultLayout from '../app/layout';

export default function Form() {
  return (
    <>
      <DefaultLayout>
        <div className="mx-auto">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSe4IIT5kS5RmAIesiVc-yKAXDujSdI05lHi18SQbajStxuAQA/viewform?embedded=true"
            width="100%"
            height="980"
            frameBorder={0}
            marginHeight={0}
            marginWidth={0}
            scrolling="no"
          >
            読み込んでいます…
          </iframe>
        </div>
      </DefaultLayout>
    </>
  );
}
