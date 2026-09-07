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
        Using more than 10 different fonts and a wider range of colors, it was hard for
        visitors to recognize our museum as a significant and fun-loving institution.
      </>
    ),
  },
  after: {
    id: 'after',
    label: 'After',
    copy: (
      <>
        <span className="fw-semibold">
          Using my new brand book, 89% of new online posts are now high quality and on brand
        </span>{' '}
        (up from 58% in the months before). Now guests and online viewers can spot our playful
        and educational mission from just a glance.
      </>
    ),
  },
  problem: {
    id: 'problem',
    label: 'Problem',
    copy: (
      <>
        <span className="fw-semibold">
          The museum&rsquo;s online assets and physical signage used all sorts of colors, fonts,
          and visual themes.
        </span>{' '}
        This put off our visitors and would-be guests, who would love to trust and visit our
        game museum!
      </>
    ),
  },
  insights: {
    id: 'insights',
    label: 'Insights',
    copy: (
      <>
        <p className="body-copy__lead">
          After talking with museum volunteers who made the assets, I noted their largest pain
          points:
        </p>
        <ol className="body-copy__list">
          <li>
            <span className="fw-semibold">Lack of Codification</span> - our brand wasn&rsquo;t
            codified and the few materials about it were scattered in different unrelated
            folders and group chats.
          </li>
          <li>
            <span className="fw-semibold">Time Constraints</span> - most museum signage is made
            in just minutes with brand recognition as a secondary priority.
          </li>
          <li>
            <span className="fw-semibold">Lack of Brand Delight</span> - if our brand
            isn&rsquo;t fun, volunteers might choose to use other visual styles instead.
          </li>
        </ol>
      </>
    ),
  },
}
