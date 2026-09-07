// Content for the recurring "body frame" pattern (label + copy + image placeholder).
// Frames 2 & 3 use this today; add future case-study sections here as new entries —
// BodyFrame.jsx and the sections that consume this array don't need to change.

export const bodyFrames = {
  before: {
    id: 'before',
    label: 'Before',
    copy: (
      <>
        <p className="body-copy__lead">
          <span className="fw-semibold">
            The museum&rsquo;s physical and digital media assets varied widely in style and
            polish.
          </span>
        </p>
        <p className="body-copy__lead">
          Using more than 10 different fonts and a wider range of colors, it was hard for
          visitors to recognize our museum as a significant and fun-loving institution.
        </p>
      </>
    ),
  },
  after: {
    id: 'after',
    label: 'After',
    copy: (
      <>
        <p className="body-copy__lead">
          <span className="fw-semibold">
            Using my new brand book, 89% of new online posts are now high quality and on brand
          </span>{' '}
          (up from 58% in the months before).
        </p>
        <p className="body-copy__lead">
          Now guests and online viewers can spot our playful and educational mission from just a
          glance.
        </p>
      </>
    ),
  },
  problem: {
    id: 'problem',
    label: 'Problem',
    copy: (
      <>
        <p className="body-copy__lead">
          <span className="fw-semibold">
            The museum&rsquo;s online assets and physical signage used all sorts of colors,
            fonts, and visual themes.
          </span>
        </p>
        <p className="body-copy__lead">
          This put off our visitors and would-be guests, who would love to trust and visit our
          game museum!
        </p>
      </>
    ),
  },
  insights: {
    id: 'insights',
    label: 'Insights',
    copy: (
      <>
        <p className="body-copy__lead">
          After talking with the museum volunteers who made the assets, I noted what kept them
          from sticking to a single brand language:
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
            isn&rsquo;t fun, volunteers might use other visual styles instead.
          </li>
        </ol>
      </>
    ),
  },
  solution1: {
    id: 'solution1',
    label: 'Making it Easy to Use',
    copy: (
      <>
        <p className="body-copy__lead">
          I defined our brand&rsquo;s use of type, color, etc. and paired it with materials from
          distant Slack group chats and Google Docs to create a definitive set of brand
          guidelines.
        </p>
        <p className="body-copy__lead">
          I also made social media asset templates along with a quick start guide to help
          volunteers use our new brand in no time!
        </p>
      </>
    ),
  },
  solution2: {
    id: 'solution2',
    label: 'Making it Fun',
    copy: (
      <>
        <p className="body-copy__lead">
          Our brand had to be fun for our visitors and fun for the volunteers using it.
        </p>
        <p className="body-copy__lead">
          I made sure to include bold visual brand examples throughout the book to get
          volunteers excited about our brand.
        </p>
        <p className="body-copy__lead">
          (Section title pages are especially great places to get creative!)
        </p>
      </>
    ),
  },
  results: {
    id: 'results',
    label: 'Results',
    copy: (
      <>
        <p className="body-copy__lead">
          <span className="fw-semibold">
            Now, 89% of new online posts are now high quality and on brand
          </span>{' '}
          (up from 58% in the months before).
        </p>
        <p className="body-copy__lead">
          With our new brand in place, visitors see our museum as a fun place to spend a
          Saturday and learn about video game history.
        </p>
        <p className="body-copy__lead">Click here to access the final brand book</p>
      </>
    ),
  },
  reflection: {
    id: 'reflection',
    label: 'Reflection',
    copy: (
      <>
        <p className="body-copy__lead">
          <span className="fw-semibold">
            I realize now that our volunteers used my work as a starting point.
          </span>{' '}
          They didn&rsquo;t need an exhaustive amount of Instagram templates; they needed me to
          start the work of rebranding in more layouts and mediums.
        </p>
        <p className="body-copy__lead">
          If I could do this project over again, I&rsquo;d focus on starting to make our brand
          work for all the museum&rsquo;s most critical assets and mediums rather than
          exhaustively &ldquo;solving&rdquo; how our brand would work for a few of them.
        </p>
      </>
    ),
  },
}
