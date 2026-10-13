import type { LayoutSettingsProps } from 'quinecms/core/layout-contract';
import type { Field } from 'quinecms/core/types';
import Fields from 'quinecms/editor/Fields';
import PanelSection from 'quinecms/editor/PanelSection';
import definition from './definition.json';
export default function Settings({
  settings,
  content,
  onChange,
}: LayoutSettingsProps) {
  return (
    <PanelSection title="Archline identity, navigation and contact">
      <Fields
        fields={definition.fields as Field[]}
        values={settings}
        media={content.media}
        collections={content.collections}
        onChange={onChange}
      />
    </PanelSection>
  );
}
