import {
  CheckIcon,
  Combobox,
  Group,
  Input,
  InputBase,
  useCombobox,
} from "@mantine/core";
import { IconCaretDownFilled } from "@tabler/icons-react";
import "./ColoredSelect.scss";
export function ColoredSelect({
  data,
  value,
  setValue,
}: {
  data: { name: string; color: string }[];
  value?: string;
  setValue: (value: string) => void;
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        combobox.selectActiveOption();
      } else {
        combobox.updateSelectedOptionIndex("active");
      }
    },
  });
  const options = data.map((item) => (
    <Combobox.Option
      value={item.name}
      key={item.name}
      active={item.name === value}
      style={{ "--option-color": item.color }}
    >
      <Group gap="xs">
        {item.name === value && <CheckIcon size={12} />}
        <span>{item.name}</span>
      </Group>
    </Combobox.Option>
  ));

  return (
    <div className="c-colored-select">
      <style></style>
      <Combobox
        store={combobox}
        resetSelectionOnOptionHover
        withinPortal={false}
        onOptionSubmit={(val) => {
          setValue(val);
          combobox.updateSelectedOptionIndex("active");
        }}
      >
        <Combobox.Target targetType="button">
          <InputBase
            component="button"
            type="button"
            pointer
            rightSection={
              <IconCaretDownFilled
                color="black"
                style={{ width: "50%", height: "50%" }}
              />
            }
            rightSectionPointerEvents="none"
            onClick={() => combobox.toggleDropdown()}
            style={{
              "--button-color": data.find((item) => item.name === value)?.color,
            }}
          >
            {value || <Input.Placeholder>Pick value</Input.Placeholder>}
          </InputBase>
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Options>{options}</Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </div>
  );
}
