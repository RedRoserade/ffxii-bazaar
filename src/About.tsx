import * as React from "react";
import { SubHeading } from "./SubHeading";

export class About extends React.Component {
  public render() {
    return (
      <div className="Page">
        <header className="PageHeader">
          <div className="PageHeaderRow">
            <h1>About</h1>
          </div>
        </header>

        <div className="PageContents">
          <section>
            <SubHeading>Motivation</SubHeading>
            <p>
              I created this companion app for when I need to sell items at the
              Bazaar in Final Fantasy XII: The Zodiac Age, and I found that
              reading the Wiki or guide pages was not the easiest thing to do on
              a phone. And also, because I was bored.
              <br />
              Please do not use this as a template for a "good React app", it's
              lacking in too many aspects. This is literally something I hacked
              together.
              <br />
              The app's code is available on GitHub:{" "}
              <a
                href="https://github.com/RedRoserade/ffxii-bazaar"
                target="blank"
                rel="noopener noreferrer"
              >
                https://github.com/RedRoserade/ffxii-bazaar
              </a>
              .
            </p>
          </section>
          <section>
            <SubHeading>Use</SubHeading>
            <p>
              Lookup an item or 'recipe' using the navigation links on the top.
              Optionally, use the search bar to quickly filter results.
              <br />
              When looking at an item that can be used in multiple recipes, you
              can choose to see all the items (and their quantities) to make
              them all in one go.
              <br />
              For more information about this, I suggest you read the{" "}
              <a
                href="http://finalfantasy.wikia.com/wiki/Bazaar_(Final_Fantasy_XII)"
                target="_blank"
                rel="noopener noreferrer"
              >
                "Bazaar Glitch"
              </a>{" "}
              section on the Wiki.
            </p>
          </section>

          <section>
            <SubHeading>Credits</SubHeading>
            <ul>
              <li>
                <a
                  href="http://finalfantasy.wikia.com/wiki/Bazaar_(Final_Fantasy_XII)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  The Final Fantasy Wiki's article on the Bazaar
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    );
  }
}
