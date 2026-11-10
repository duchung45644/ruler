# Editing

PixelLens lets you change a page's CSS, text and markup right in the browser, then copy the result as code. Edits only change the page in your browser; they never touch the site's files.

Editing lives in the side panel's **Element** tab (press `0`) and works on the selected element.

## Editing CSS

The **CSS** section lists, like DevTools: `element.style` (the inline style) first, then the matched rules in cascade order, then inherited rules (**Inherited from …**).

- Click a property or value to edit it. `Enter` in a property moves to its value; `Enter` in a value applies it and moves to the next line; `Esc` leaves the field.
- Property names suggest completions as you type: `↑` `↓` to choose, `Enter` or `Tab` to accept.
- In a numeric value, `↑` / `↓` change the number by 1, with `Shift` by 10, with `Alt` by 0.1.
- The checkbox before a declaration (**Turn this declaration on or off**) disables it without deleting it.
- A rule's selector can be edited when the rule is editable: `Enter` applies, `Esc` restores it.
- **Filter** keeps only rules whose selector or property names match.
- **Add Rule** (the + button) adds a new rule for the selected element.
- **.cls** (**Classes**) shows a field to edit the element's classes, with suggestions from the page.

Markers explain each line:

- A red dot and **Unknown property** or **Invalid value** for something the browser rejects.
- Struck-through with **Overridden by …** when another rule wins.
- Dimmed with **Not inherited by this element** for an inherited property that does not apply.
- An amber dot with **Overridden by a stylesheet PixelLens can't read** when a cross-origin stylesheet wins. Use **Grant access** to let PixelLens read such stylesheets ("Some styles may be missing.").

## Force states

The **Force state** chips force a pseudo-class on the selected element: `:hover`, `:focus`, `:focus-visible`, `:focus-within`, `:active`, `:visited`. Dimmed chips mean **No rule uses this state on this element**. Click a chip again to release it. Forced states are dropped when you deselect the element.

## Editing text

**Edit Text** (the T button in the edit toolbar) makes the page's text editable: click anywhere and type. Click it again to stop. While it is on, the other edit buttons are disabled and only **Inspector**, **Toggle Side Panel** and **Quit** work on the dock.

## Editing elements

The edit toolbar acts on the selected element:

| Button        | Key                   | Action                                                      |
| ------------- | --------------------- | ----------------------------------------------------------- |
| **Copy**      | `Ctrl+C`              | Copy the element                                            |
| **Cut**       | `Ctrl+X`              | Cut the element                                             |
| **Paste**     | `Ctrl+V`              | Paste the copied element (enabled once something is copied) |
| **Duplicate** | `Ctrl+D`              | Duplicate the element                                       |
| **Delete**    | `Delete`, `Backspace` | Delete the element                                          |

On macOS use `Cmd`. When text is selected on the page, `Ctrl+C` and `Ctrl+X` keep their normal browser meaning.

## Undo and redo

**Undo** and **Redo** in the edit toolbar, or `Ctrl+Z`, `Ctrl+Shift+Z` and `Ctrl+Y` (on the page or in the side panel), step through text, markup and class edits.

CSS rule and inline style edits are not part of that history. To take one back, edit the value again or revert it in the **Changes** list.

## Saved per site

PixelLens remembers your CSS rule edits and inline style edits for each site (each origin; for local files, each file path) and puts them back the next time you turn PixelLens on there. A message such as **3 saved edits restored** confirms it. Text and markup edits are not saved.

To forget every saved edit, open [Settings](settings.md) and use **Clear** next to **Saved edits**.

## The Changes list

The **Changes** tab lists every change on the page, grouped by element (**1 Element**, **3 Elements**):

- Each group shows the element and its number of rules changed. Click the element to select it on the page.
- Each changed rule shows its source file and a before/after diff. The revert button on a rule undoes that change.
- The trash button on a group discards every change on that element, after a confirmation.
- Markup changes are listed with the group too. Changes that only touch whitespace are marked **Whitespace-only changes**.
- **Clear All Changes** discards every change on the page, after a confirmation.

When there are none, the tab shows **No changes found**.

## Copy all

**Copy all** copies every change as code, in the format picked next to it (**Export format**):

- **CSS**: the changed rules as CSS.
- **Tailwind**: the changes as Tailwind classes.
- **AI prompt**: a prompt describing the changes and the page URL, ready to paste into an AI coding assistant.
