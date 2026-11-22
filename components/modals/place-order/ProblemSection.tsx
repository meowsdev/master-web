'use client';

import { Alert02Icon, Note01Icon, ScaleIcon, Wrench01Icon } from '@hugeicons/core-free-icons';
import { OrderAnswer } from '@/types/order-placement.types';
import { usePlaceOrderForm } from '@/hooks/usePlaceOrderForm';
import { CountStepper } from './CountStepper';
import { OrderField, OrderSelect, fieldControlClass } from './OrderField';
import { formatTaka } from './format-taka';
import { FormPart } from './FormPart';

type FormState = ReturnType<typeof usePlaceOrderForm>;

/*
 * Main service -> sub-service ("problem", with a quantity when countable)
 * -> optional text -> the main service's follow-up questions.
 */
export function ProblemSection({ state }: { state: FormState }) {
  const { catalog, category, subService } = state;

  return (
    <FormPart step={1} title="সার্ভিসের তথ্য" hint="কোন সার্ভিস, কী সমস্যা" isDone={Boolean(subService)}>
      <OrderSelect
        icon={Wrench01Icon}
        placeholder="সার্ভিস সিলেক্ট করুন"
        value={state.categoryId}
        options={(catalog?.categories ?? []).map((item) => ({ value: item.id, label: item.name }))}
        onChange={state.selectCategory}
      />

      {category && (
        <div className="flex items-end gap-[16px]">
          <div className="min-w-0 flex-1">
            <OrderSelect
              icon={Alert02Icon}
              placeholder="সমস্যা সিলেক্ট করুন"
              value={state.subServiceId}
              options={category.services.map((service) => ({
                value: service.id,
                label: `${service.nameBn || service.name} (${formatTaka(service.basePrice)})`,
              }))}
              onChange={state.selectSubService}
            />
          </div>
          {subService?.isCountable && (
            <CountStepper
              label="How many units"
              value={state.quantity}
              max={subService.maxQuantity}
              onChange={state.setQuantity}
            />
          )}
        </div>
      )}

      {subService && (
        <OrderField icon={Note01Icon}>
          <input
            value={state.description}
            onChange={(event) => state.setDescription(event.target.value)}
            maxLength={1000}
            placeholder="চাইলে সমস্যা বিস্তারিত লিখতে পারেন..."
            className={fieldControlClass}
          />
        </OrderField>
      )}

      {subService &&
        category?.questions.map((question) => {
          const answer = state.answers[question.id];
          const chosen = question.options.find((option) => option.id === answer?.optionId);
          return (
            <div key={question.id} className="flex items-end gap-[16px]">
              <div className="min-w-0 flex-1">
                <OrderSelect
                  icon={ScaleIcon}
                  placeholder={question.textBn || question.text}
                  value={answer?.optionId ?? null}
                  options={question.options.map((option) => ({
                    value: option.id,
                    label: `${option.labelBn || option.label}${Number(option.unitPrice) > 0 ? ` (${formatTaka(option.unitPrice)})` : ''}`,
                  }))}
                  onChange={(optionId) =>
                    state.setAnswer(optionId ? ({ questionId: question.id, optionId, count: 1 } as OrderAnswer) : null, question.id)
                  }
                />
              </div>
              {chosen?.isCountable && answer && (
                <CountStepper
                  label={`How many units: ${question.text}`}
                  value={answer.count}
                  // A risky outdoor unit can't outnumber the ACs being serviced.
                  max={state.quantity}
                  onChange={(count) => state.setAnswer({ ...answer, count }, question.id)}
                />
              )}
            </div>
          );
        })}
    </FormPart>
  );
}
