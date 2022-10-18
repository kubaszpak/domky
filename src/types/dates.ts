import { FocusedInput, OnDatesChangeProps } from "@datepicker-react/styled";


export const FOCUS_CHANGE = "focusChange";
type FOCUS_CHANGE = typeof FOCUS_CHANGE;
export const DATE_CHANGE = "dateChange";
type DATE_CHANGE = typeof DATE_CHANGE;

export interface DateChangeAction {
	type: DATE_CHANGE;
	payload: OnDatesChangeProps;
}

export interface FocusChangeAction {
	type: FOCUS_CHANGE;
	payload: FocusedInput;
}
