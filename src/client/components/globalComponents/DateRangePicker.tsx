import { Button, Popover, TextInput } from "flowbite-react";
import { Datepicker } from "flowbite-react";
import { DateTime } from "luxon";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface DateRange {
  from?: string;
  to?: string;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (value: DateRange) => void;
  name?: string;
}

const DateRangePicker = ({ value, onChange }: DateRangePickerProps) => {
  const popoverRef = useRef(null);
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const [from, setFrom] = useState<Date | undefined>(
    value?.from ? DateTime.fromISO(value.from).toJSDate() : undefined
  );
  const [to, setTo] = useState<Date | undefined>(
    value?.to ? DateTime.fromISO(value.to).toJSDate() : undefined
  );

  const [error, setError] = useState<string | null>(null);

  const displayValue = [from, to]
    .map((d) => (d ? DateTime.fromJSDate(d).toFormat("dd.MM.yyyy") : ""))
    .filter(Boolean)
    .join(" – ");

  const handleConfirm = () => {
    if (from && to && from > to) {
      setError("Datum do nemůže být před datem od");
      return;
    }

    const result = {
      from: from ? DateTime.fromJSDate(from).toISODate() : undefined,
      to: to ? DateTime.fromJSDate(to).toISODate() : undefined,
    };

    onChange?.(result);
    setError(null);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setError(null);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        popoverRef.current &&
        !(popoverRef.current as any).contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={popoverRef} className="w-full">
      <Popover
        trigger="click"
        placement="bottom-start"
        open={isOpen}
        content={
          <div className="p-3 bg-white items-center">
            <div className="flex gap-4">
              <div>
                <p className="text-sm mb-1 font-semibold">{t("labels.from")}</p>
                <Datepicker
                  inline
                  showTodayButton={false}
                  showClearButton={false}
                  defaultDate={from}
                  onSelectedDateChanged={setFrom}
                  maxDate={to}
                />
              </div>
              <div>
                <p className="text-sm mb-1 font-semibold">{t("labels.to")}</p>
                <Datepicker
                  inline
                  showTodayButton={false}
                  showClearButton={false}
                  defaultDate={to}
                  onSelectedDateChanged={setTo}
                  minDate={from}
                />
              </div>
            </div>

            {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

            <div className="flex justify-end mt-4 space-x-2">
              <Button onClick={handleCancel} color={"gray"}>
                {t("labels.cancel")}
              </Button>
              <Button onClick={handleConfirm} disabled={!from && !to}>
                {t("labels.confirm")}
              </Button>
            </div>
          </div>
        }
      >
        <TextInput
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          value={displayValue}
          placeholder={t("labels.selectRange")}
          className="min-w-full"
        />
      </Popover>
    </div>
  );
};

export default DateRangePicker;
