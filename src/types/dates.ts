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

export const initialState: OnDatesChangeProps = {
	startDate: null,
	endDate: null,
	focusedInput: null,
};

export function reducer(
	state: OnDatesChangeProps,
	action: DateChangeAction | FocusChangeAction
) {
	switch (action.type) {
		case FOCUS_CHANGE:
			return { ...state, focusedInput: action.payload };
		case DATE_CHANGE:
			return action.payload;
		default:
			throw new Error();
	}
}