import React, { useEffect, useRef, useState } from "react";
import {
  Datepicker,
  DatepickerProps,
  TextInput,
  Popover,
} from "flowbite-react";
import { DateTime } from "luxon";

const DateTimePicker = (
  props: DatepickerProps & {
    value?: string;
    format?: string;
    onlydate?: boolean;
    onChange?: (value: React.ChangeEvent<HTMLInputElement> | string) => void;
  }
) => {
  const popoverRef = useRef(null);

  const getDatetime = (date?: Date, time?: string) => {
    if (props.onlydate) {
      if (date) return DateTime.fromJSDate(date).toFormat(format);
    } else {
      if (date) {
        const [hours, minutes, seconds = 0] = time
          ? time.split(":").map(Number)
          : [0, 0, 0];
        return DateTime.fromJSDate(date)
          .plus({ hours, minutes, seconds })
          .toFormat(format);
      }
    }
    return "";
  };

  const format =
    props.format || (props.onlydate ? "dd.MM.yyyy" : "dd.MM.yyyy HH:mm");
  const dateValue = props.value
    ? DateTime.fromISO(props.value).toJSDate()
    : undefined;
  const timeValue = props.value
    ? DateTime.fromISO(props.value).toFormat("HH:mm")
    : "00:00";
  const [date, setDate] = useState(dateValue);

  const [time, setTime] = useState(timeValue); // Vybraný čas
  const [inputValue, setInputValue] = useState(getDatetime(dateValue)); // Zobrazená hodnota v inputu
  const [isOpen, setIsOpen] = useState(false); // Stav pro otevření popoveru

  const handleDateChange = (selectedDate) => {
    if (props.onlydate) {
      setInputValue(getDatetime(selectedDate));
      setDate(selectedDate);
      setIsOpen(false);
    } else {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event) => {
    setTime(event.target.value);
  };

  const handleConfirm = () => {
    if (date && time) {
      const result = getDatetime(date, time);
      setInputValue(result);
      props.onChange?.(result);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  // Kliknutí mimo Popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={popoverRef}>
      <Popover
        trigger="click"
        className="relative z-20"
        placement="bottom-start"
        open={isOpen}
        content={
          <div className="p-3 bg-white items-center">
            {props.onlydate ? null : (
              <TextInput
                type="time"
                // step="1"
                value={time}
                onChange={handleTimeChange}
              />
            )}
            <Datepicker
              inline
              showTodayButton={false}
              showClearButton={false}
              defaultDate={date}
              onSelectedDateChanged={handleDateChange}
              weekStart={1}
            />
            {props.onlydate ? null : (
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Potvrdit
                </button>
              </div>
            )}
          </div>
        }
      >
        <TextInput
          type="text"
          value={inputValue}
          placeholder="Vyberte datum a čas"
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          className="w-full"
        />
      </Popover>
    </div>
  );
};

export default DateTimePicker;
