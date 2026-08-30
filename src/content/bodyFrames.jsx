// Content for the recurring "body frame" pattern (label + copy + image placeholder).
// Frames 2 & 3 use this today; add future case-study sections here as new entries —
// BodyFrame.jsx and the sections that consume this array don't need to change.

export const bodyFrames = {
  before: {
    id: 'before',
    label: 'Before',
    copy: (
      <>
        <span className="fw-semibold">
          The museum&rsquo;s physical and digital media assets varied widely in style and polish.
        </span>{' '}
        Using more than 10 different fonts and a wider range of colors, it was difficult for
        visitors to learn what the museum was all about.
      </>
    ),
  },
  after: {
    id: 'after',
    label: 'After',
    copy: (
      <>
        <span className="fw-semibold">
          Now, 89% of new online posts are high quality and on brand
        </span>{' '}
        (up from 58% in the months before). The codified brand book improved our communication
        efficacy and asset quality.
      </>
    ),
  },
  problem: {
    id: 'problem',
    label: 'Problem',
    copy: (
      <>
        <p className="body-copy__lead">
          After talking to museum volunteers, I learned that they were struggling to make branded
          content due to:
        </p>
        <ol className="body-copy__list">
          <li>
            <span className="fw-semibold">An Undefined Brand</span> - volunteers don&rsquo;t know
            what our brand is about and how to recreate it.
          </li>
          <li>
            <span className="fw-semibold">Time Constraints</span> - volunteers are busy doing
            other responsibilities, so most museum signage is made in a matter of minutes.
          </li>
          <li>
            <span className="fw-semibold">Little Brand Excitement</span> - if our brand
            isn&rsquo;t exciting, volunteers might choose other visual styles instead.
          </li>
        </ol>
      </>
    ),
  },
}
