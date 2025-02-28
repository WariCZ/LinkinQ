import { Errors, Description, Label } from "@bpmn-io/form-js";

import { html } from "diagram-js/lib/ui";

export function RangeRenderer(props: any) {
  const { id, formId, label, errorMessageId, errors, description } = props;

  return html`<div class="my-component-wrapper">
    <${Label} id=${id + "-" + formId} label=${label} />
    <div class="my-form-component">// ...</div>
    <${Description} description=${description} />
    <${Errors} errors=${errors} id=${errorMessageId} />
  </div>`;
}
