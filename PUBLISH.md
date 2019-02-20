
To publish a package, simply run `npm publish` after ensuring that the version has been  bumped in the `package.json`
Because package.json:publishConfig.tag is set to `next`, any new published package will have the tag `next`
To specify a differnt tag upon publish (such as `unstable` or `canary`), use: `npm publish --tag canary`

Once published, `npm dist-tags test-scenarii` lists the tags for this package

Once the `next` version is ready, make it available with: `npm dist-tag add test-scenarii@0.24 latest`
But first, tag the previous version with `npm dist-tag add test-scenarii@0.23 previous`

Don't forget to push tags with `git push origin <tag name>`