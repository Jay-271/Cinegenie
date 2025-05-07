interface Props { // when making components please use Props always
  title: string;
  items: string[];
}

function Dropdown({ title, items }: Props) {
  return (
    <>
      <select className="custom-select custom-select-lg mb-3">
        <option selected>{title}</option>
        {items.map((item, index) => (
          <option key={index}> {item} </option>
        ))}
      </select>
    </>
  );
}

export default Dropdown;
