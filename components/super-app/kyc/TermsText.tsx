import { ProviderTerms } from '@/services/provider-terms.service';

/* The provider terms as the provider reads them: the same layout in the KYC, the re-accept pop-up and the admin preview. */
export function TermsText({ terms }: { terms: Pick<ProviderTerms, 'title' | 'sections'> }) {
  return (
    <>
      <h3 className="text-[16px] font-semibold text-ink">{terms.title}</h3>
      <div className="mt-[12px] flex flex-col gap-[16px] rounded-[12px] border border-line bg-white p-[14px]">
        {terms.sections.map((section, index) => (
          <section key={`${section.heading}-${index}`}>
            <h4 className="text-[14px] font-semibold text-ink">{section.heading}</h4>
            <ul className="mt-[6px] flex list-disc flex-col gap-[6px] pl-[18px] text-[13px] font-medium leading-relaxed text-ink">
              {section.points.map((point, pointIndex) => (
                <li key={`${pointIndex}-${point.slice(0, 20)}`}>{point}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
