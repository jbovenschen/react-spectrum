/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {AriaDateFieldProps, AriaTimeFieldProps, DateValue, mergeProps, TimeValue, useDateField, useDateSegment, useLocale, useTimeField} from 'react-aria';
import {ContextValue, forwardRefType, Provider, removeDataAttributes, RenderProps, SlotProps, StyleRenderProps, useContextProps, useRenderProps, useSlot} from './utils';
import {createCalendar} from '@internationalized/date';
import {DateFieldState, DateSegmentType, DateSegment as IDateSegment, TimeFieldState, useDateFieldState, useTimeFieldState} from 'react-stately';
import {filterDOMProps, useObjectRef} from '@react-aria/utils';
import {Group, GroupContext} from './Group';
import {Input, InputContext} from './Input';
import {LabelContext} from './Label';
import React, {cloneElement, createContext, ForwardedRef, forwardRef, ReactElement, useContext, useRef} from 'react';
import {TextContext} from './Text';

export interface DateFieldRenderProps {
  /**
   * State of the date field.
   */
  state: DateFieldState,
  /**
   * Whether the date field is invalid.
   * @selector [data-invalid]
   */
  isInvalid: boolean,
  /**
   * Whether the date field is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean
}
export interface DateFieldProps<T extends DateValue> extends Omit<AriaDateFieldProps<T>, 'label' | 'description' | 'errorMessage' | 'validationState'>, RenderProps<DateFieldRenderProps>, SlotProps {}
export interface TimeFieldProps<T extends TimeValue> extends Omit<AriaTimeFieldProps<T>, 'label' | 'description' | 'errorMessage' | 'validationState'>, RenderProps<DateFieldRenderProps>, SlotProps {}

export const DateFieldContext = createContext<ContextValue<DateFieldProps<any>, HTMLDivElement>>(null);
export const TimeFieldContext = createContext<ContextValue<TimeFieldProps<any>, HTMLDivElement>>(null);
export const DateFieldStateContext = createContext<DateFieldState | null>(null);
export const TimeFieldStateContext = createContext<TimeFieldState | null>(null);

function DateField<T extends DateValue>(props: DateFieldProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, DateFieldContext);
  let {locale} = useLocale();
  let state = useDateFieldState({
    ...props,
    locale,
    createCalendar
  });

  let fieldRef = useRef<HTMLDivElement>(null);
  let [labelRef, label] = useSlot();
  let inputRef = useRef<HTMLInputElement>(null);
  let {labelProps, fieldProps, inputProps, descriptionProps, errorMessageProps} = useDateField({...removeDataAttributes(props), label, inputRef}, state, fieldRef);

  let renderProps = useRenderProps({
    ...removeDataAttributes(props),
    values: {
      state,
      isInvalid: state.isInvalid,
      isDisabled: state.isDisabled
    },
    defaultClassName: 'react-aria-DateField'
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <Provider
      values={[
        [DateFieldStateContext, state],
        [GroupContext, {...fieldProps, ref: fieldRef}],
        [InputContext, {...inputProps, ref: inputRef}],
        [LabelContext, {...labelProps, ref: labelRef, elementType: 'span'}],
        [TextContext, {
          slots: {
            description: descriptionProps,
            errorMessage: errorMessageProps
          }
        }]
      ]}>
      <div
        {...DOMProps}
        {...renderProps}
        ref={ref}
        slot={props.slot || undefined}
        data-invalid={state.isInvalid || undefined} />
    </Provider>
  );
}

/**
 * A date field allows users to enter and edit date and time values using a keyboard.
 * Each part of a date value is displayed in an individually editable segment.
 */
const _DateField = /*#__PURE__*/ (forwardRef as forwardRefType)(DateField);
export {_DateField as DateField};

function TimeField<T extends TimeValue>(props: TimeFieldProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, TimeFieldContext);
  let {locale} = useLocale();
  let state = useTimeFieldState({
    ...props,
    locale
  });

  let fieldRef = useRef<HTMLDivElement>(null);
  let [labelRef, label] = useSlot();
  let inputRef = useRef<HTMLInputElement>(null);
  let {labelProps, fieldProps, inputProps, descriptionProps, errorMessageProps} = useTimeField({...removeDataAttributes(props), label, inputRef}, state, fieldRef);

  let renderProps = useRenderProps({
    ...props,
    values: {
      state,
      isInvalid: state.isInvalid,
      isDisabled: state.isDisabled
    },
    defaultClassName: 'react-aria-TimeField'
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <Provider
      values={[
        [TimeFieldStateContext, state],
        [GroupContext, {...fieldProps, ref: fieldRef}],
        [InputContext, {...inputProps, ref: inputRef}],
        [LabelContext, {...labelProps, ref: labelRef, elementType: 'span'}],
        [TextContext, {
          slots: {
            description: descriptionProps,
            errorMessage: errorMessageProps
          }
        }]
      ]}>
      <div
        {...DOMProps}
        {...renderProps}
        ref={ref}
        slot={props.slot || undefined}
        data-invalid={state.isInvalid || undefined} />
    </Provider>
  );
}

/**
 * A time field allows users to enter and edit time values using a keyboard.
 * Each part of a time value is displayed in an individually editable segment.
 */
const _TimeField = /*#__PURE__*/ (forwardRef as forwardRefType)(TimeField);
export {_TimeField as TimeField};

export interface DateInputRenderProps {
  /**
   * Whether the date input is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean,
  /**
   * Whether an element within the date input is focused, either via a mouse or keyboard.
   * @selector [data-focus-within]
   */
  isFocusWithin: boolean,
  /**
   * Whether an element within the date input is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the date input is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean
}

export interface DateInputProps extends SlotProps, StyleRenderProps<DateInputRenderProps> {
  children: (segment: IDateSegment) => ReactElement
}

function DateInput(props: DateInputProps, ref: ForwardedRef<HTMLDivElement>): JSX.Element {
  // If state is provided by DateField/TimeField, just render.
  // Otherwise (e.g. in DatePicker), we need to call hooks and create state ourselves.
  let dateFieldState = useContext(DateFieldStateContext);
  let timeFieldState = useContext(TimeFieldStateContext);
  return dateFieldState || timeFieldState
    ? <DateInputInner {...props} ref={ref} />
    : <DateInputStandalone {...props} ref={ref} />;
}

const DateInputStandalone = forwardRef((props: DateInputProps, ref: ForwardedRef<HTMLDivElement>) => {
  let [dateFieldProps, fieldRef] = useContextProps({slot: props.slot} as DateFieldProps<any>, ref, DateFieldContext);
  let {locale} = useLocale();
  let state = useDateFieldState({
    ...dateFieldProps,
    locale,
    createCalendar
  });

  let inputRef = useRef<HTMLInputElement>(null);
  let {fieldProps, inputProps} = useDateField({...dateFieldProps, inputRef}, state, fieldRef);

  return (
    <Provider
      values={[
        [DateFieldStateContext, state],
        [InputContext, {...inputProps, ref: inputRef}],
        [GroupContext, {...fieldProps, ref: fieldRef}]
      ]}>
      <DateInputInner {...props} />
    </Provider>
  );
});

const DateInputInner = forwardRef((props: DateInputProps, ref: ForwardedRef<HTMLDivElement>) => {
  let {className, children} = props;
  let dateFieldState = useContext(DateFieldStateContext);
  let timeFieldState = useContext(TimeFieldStateContext);
  let state = dateFieldState ?? timeFieldState!;

  return (
    <>
      <Group
        {...props}
        ref={ref}
        slot={props.slot || undefined}
        className={className ?? 'react-aria-DateInput'}
        isInvalid={state.isInvalid}>
        {state.segments.map((segment, i) => cloneElement(children(segment), {key: i}))}
      </Group>
      <Input />
    </>
  );
});

/**
 * A date input groups the editable date segments within a date field.
 */
const _DateInput = /*#__PURE__*/ (forwardRef as forwardRefType)(DateInput);
export {_DateInput as DateInput};

export interface DateSegmentRenderProps extends Omit<IDateSegment, 'isEditable'> {
  /**
   * Whether the value is a placeholder.
   * @selector [data-placeholder]
   */
  isPlaceholder: boolean,
  /**
   * Whether the segment is read only.
   * @selector [data-readonly]
   */
  isReadOnly: boolean,
  /**
   * Whether the date field is in an invalid state.
   * @selector [data-invalid]
   */
  isInvalid: boolean,
  /**
   * The type of segment. Values include `literal`, `year`, `month`, `day`, etc.
   * @selector [data-type="..."]
   */
  type: DateSegmentType
}

export interface DateSegmentProps extends RenderProps<DateSegmentRenderProps> {
  segment: IDateSegment
}

function DateSegment({segment, ...otherProps}: DateSegmentProps, ref: ForwardedRef<HTMLDivElement>) {
  let dateFieldState = useContext(DateFieldStateContext);
  let timeFieldState = useContext(TimeFieldStateContext);
  let state = dateFieldState ?? timeFieldState!;
  let domRef = useObjectRef(ref);
  let {segmentProps} = useDateSegment(segment, state, domRef);
  let renderProps = useRenderProps({
    ...otherProps,
    values: {
      ...segment,
      isReadOnly: !segment.isEditable,
      isInvalid: state.isInvalid
    },
    defaultChildren: segment.text,
    defaultClassName: 'react-aria-DateSegment'
  });

  return (
    <div
      {...mergeProps(filterDOMProps(otherProps as any), segmentProps)}
      {...renderProps}
      ref={domRef}
      data-placeholder={segment.isPlaceholder || undefined}
      data-invalid={state.isInvalid || undefined}
      data-readonly={!segment.isEditable || undefined}
      data-type={segment.type} />
  );
}

/**
 * A date segment displays an individual unit of a date and time, and allows users to edit
 * the value by typing or using the arrow keys to increment and decrement.
 */
const _DateSegment = /*#__PURE__*/ (forwardRef as forwardRefType)(DateSegment);
export {_DateSegment as DateSegment};
