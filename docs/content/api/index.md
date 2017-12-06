@ngdoc content
@name How to write documentation
@description

# How to document
-----------------
## module

```js
/**
 *
 * @ngdoc module                <---- required
 * @name components.contact     <---- required
 *
 * @requires ui.router          <---- optional
 *
 * @description                 <---- optional, markdown syntax
 *
 * This is the contact module. It includes all of our components for the contact feature.
 * ## This also parses down Markdown
 *
 * - So you can add lists
 * - List 2
 *
 * ###And regular paragraph and headlines
 *
 **/
```

## Method: inside a controller/service
```js
/**
 * @ngdoc method                                <---- required
 * @name ContactEditController#updateContact    <---- required, ServiceName/ControllerName#methodName
 *
 * @param {event} event Receive the emitted event
 * Updates the contact information
 *
 * @return {method} ContactService returns the updateContact method and a promise
 */
```

## Service
```js
/**
 * @ngdoc service               <---- required
 * @name ContactService         <---- required
 * @module components.contact   <---- required
 *
 * @description Provides HTTP methods for our firebase connection.
 *
 * ## Lorem Ipsum 1
 * Aenean ornare odio elit, eget facilisis ipsum molestie ac. Nam bibendum a nibh ut ullamcorper.
 * Donec non felis gravida, rutrum ante mattis, sagittis urna. Sed quam quam, facilisis vel cursus at.
 *
 * ## Lorem Ipsum 2
 * Aenean ornare odio elit, eget facilisis ipsum molestie ac. Nam bibendum a nibh ut ullamcorper.
 * Donec non felis gravida, rutrum ante mattis, sagittis urna. Sed quam quam, facilisis vel cursus at.
 */
```

## Controller
```js
/**
 * @ngdoc type                    <---- required
 * @module components.contact     <---- required
 * @name ContactEditController    <---- required
 *
 * @description
 *
 * ## Lorem Ipsum 1
 * Aenean ornare odio elit, eget facilisis ipsum molestie ac. Nam bibendum a nibh ut ullamcorper.
 * Donec non felis gravida, rutrum ante mattis, sagittis urna. Sed quam quam, facilisis vel cursus at.
 *
 * ## Lorem Ipsum 2
 * Aenean ornare odio elit, eget facilisis ipsum molestie ac. Nam bibendum a nibh ut ullamcorper.
 * Donec non felis gravida, rutrum ante mattis, sagittis urna. Sed quam quam, facilisis vel cursus at.
 */
```

## Directive/Component
```js
/**
 * @ngdoc directive           <---- required
 * @name lengthCheck          <---- required
 * @module components.contact <---- required
 *
 * @description
 *
 * Aenean ornare odio elit, eget facilisis ipsum molestie ac. Nam bibendum a nibh ut ullamcorper.
 * Donec non felis gravida, rutrum ante mattis, sagittis urna. Sed quam quam, facilisis vel cursus at.
 *
 * @usage
 *
 * ### How to use
 * Aenean ornare odio elit, eget facilisis ipsum molestie ac. Nam bibendum a nibh ut ullamcorper.
 * Donec non felis gravida, rutrum ante mattis, sagittis urna. Sed quam quam, facilisis vel cursus at.
 **/

```

## Link between components
Use `{ @link component-name }`. Note: there no space between `{` and `@link`. <br>
Example: {@link PageBuilderHttpService}

# Generate docs
---------------
```sh
    gulp clean-docs
```

then
 
```sh
    gulp dgeni
```

then 

```sh
    npm start
```

and access via http://localhost:3001
