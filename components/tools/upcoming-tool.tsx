const upcomingTools = [
  ["JWT Inspector", "Decode token headers and payloads locally."],
  ["Timestamp Lab", "Convert Unix timestamps and time zones."],
  ["UUID Generator", "Generate UUID values in the browser."],
  ["Text Diff", "Compare two blocks of text line by line."],
];

export function UpcomingTool() {
  return (
    <>
      <h2>Upcoming Tools</h2>
      <p>These utilities already have a reserved place in the workbench and can become dedicated pages when needed.</p>
      <div className="service-grid">
        {upcomingTools.map(([name, description], index) => <article className="brutal-card service-card" key={name}><span>0{index + 1}.</span><h3>{name}</h3><p>{description}</p></article>)}
      </div>
    </>
  );
}
