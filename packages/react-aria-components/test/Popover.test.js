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

import {act, pointerMap, render} from '@react-spectrum/test-utils';
import {Button, Dialog, DialogTrigger, OverlayArrow, Popover} from '../';
import React from 'react';
import userEvent from '@testing-library/user-event';

let TestPopover = () => (
  <DialogTrigger>
    <Button />
    <Popover>
      <OverlayArrow>
        <svg width={12} height={12}>
          <path d="M0 0,L6 6,L12 0" />
        </svg>
      </OverlayArrow>
      <Dialog>Popover</Dialog>
    </Popover>
  </DialogTrigger>
);

describe('Popover', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });
  afterEach(() => {
    act(() => jest.runAllTimers());
  });

  it('works with a dialog', async () => {
    let {getByRole, queryByRole} = render(<TestPopover />);

    let button = getByRole('button');
    expect(queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(button);

    let dialog = getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    await user.click(document.body);

    expect(dialog).not.toBeInTheDocument();
  });

  it('should handle focus', async () => {
    let {getByRole} = render(<TestPopover />);

    let button = getByRole('button');

    await user.tab();
    expect(button).toHaveFocus();

    await user.click(button);

    let dialog = getByRole('dialog');
    expect(dialog).toHaveFocus();

    await user.click(document.body);
    act(() => jest.runAllTimers());

    expect(button).toHaveFocus();
  });

  it('should support render props', async () => {
    let {getByRole} = render(
      <DialogTrigger>
        <Button />
        <Popover placement="bottom start">
          {({placement}) => <Dialog>Popover at {placement}</Dialog>}
        </Popover>
      </DialogTrigger>
    );

    let button = getByRole('button');

    await user.click(button);

    let dialog = getByRole('dialog');
    expect(dialog).toHaveTextContent('Popover at bottom');
  });

  it('should support being used standalone', async () => {
    let triggerRef = React.createRef();
    let onOpenChange = jest.fn();
    let {getByRole} = render(<>
      <span ref={triggerRef}>Trigger</span>
      <Popover isOpen triggerRef={triggerRef} onOpenChange={onOpenChange}>
        <Dialog>A popover</Dialog>
      </Popover>
    </>);

    let dialog = getByRole('dialog');
    expect(dialog).toHaveTextContent('A popover');

    await user.click(document.body);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('isOpen and defaultOpen should override state from context', async () => {
    let onOpenChange = jest.fn();
    let {getByRole} = render(<>
      <DialogTrigger>
        <Button />
        <Popover isOpen onOpenChange={onOpenChange}>
          <Dialog>A popover</Dialog>
        </Popover>
      </DialogTrigger>
    </>);

    let dialog = getByRole('dialog');
    expect(dialog).toHaveTextContent('A popover');

    await user.click(document.body);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
