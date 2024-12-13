import * as React from "react";
import {format} from "date-fns";
import {Calendar as CalendarIcon} from "lucide-react";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {AriaTimeFieldProps, TimeValue, useDateSegment, useLocale, useTimeField} from "react-aria";
import {DateFieldState, DateSegment as IDateSegment, TimeFieldStateOptions, useTimeFieldState} from "react-stately";

interface Props {
  className?: React.HTMLAttributes<HTMLDivElement>;
  value: Date | undefined;
  setValue: (date: Date | undefined) => void;
}
interface DateSegmentProps {
  segment: IDateSegment;
  state: DateFieldState;
}

function DateSegment({segment, state}: DateSegmentProps) {
  const ref = React.useRef(null);

  const {
    segmentProps: {...segmentProps},
  } = useDateSegment(segment, state, ref);

  return (
    <div
      {...segmentProps}
      ref={ref}
      className={cn(
        "focus:rounded-[2px] focus:bg-accent focus:text-accent-foreground focus:outline-none",
        segment.type !== "literal" ? "px-[1px]" : "",
        segment.isPlaceholder ? "text-muted-foreground" : ""
      )}
    >
      {segment.text}
    </div>
  );
}

function TimeField(props: AriaTimeFieldProps<TimeValue>) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  const {locale} = useLocale();
  const state = useTimeFieldState({
    ...props,
    locale,
  });
  const {
    fieldProps: {...fieldProps},
  } = useTimeField(props, state, ref);

  return (
    <div
      {...fieldProps}
      ref={ref}
      className={cn(
        "inline-flex h-10 w-full flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        props.isDisabled ? "cursor-not-allowed opacity-50" : ""
      )}
    >
      {state.segments.map((segment, i) => (
        <DateSegment key={i} segment={segment} state={state} />
      ))}
    </div>
  );
}

const TimePicker = React.forwardRef<HTMLDivElement, Omit<TimeFieldStateOptions<TimeValue>, "locale">>((props) => {
  return <TimeField {...props} />;
});

TimePicker.displayName = "TimePicker";

export {TimePicker};

export function DatePicker({className, value, setValue}: Props) {
  console.log(value);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(" justify-start text-left font-normal", !value && "text-muted-foreground")}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            {value ? format(value, "LLL dd, y") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="single"
            defaultMonth={value}
            selected={value}
            onSelect={(date) => {
              setValue(date);
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
