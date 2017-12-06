var path    = require('canonical-path');
var Package = require('dgeni').Package;

var package = new Package('xxxTemplatexxx.documentation', [
    require('dgeni-packages/ngdoc'),
    require('dgeni-packages/nunjucks')
]);

package
    .processor(require('./processors/api-data'))
    .processor(require('./processors/index-page'))

    .config(function (readFilesProcessor, writeFilesProcessor, templateFinder) {

        var basePath = path.resolve(__dirname, '../..');

        var sourceCode = {
            include: path.resolve(basePath, 'src/client/app/**/*.js'),
            exclude: path.resolve(basePath, '**/*.spec.js') // excludes test files
        };

        // Our static Markdown documents
        // We are specifying the path and telling Dgeni to use the ngdocFileReader
        // to parse the Markdown files to HTMLs
        var mdFiles = {
            include: 'docs/content/**/*.md', basePath: 'docs/content', fileReader: 'ngdocFileReader'
        };

        readFilesProcessor.basePath    = basePath;
        readFilesProcessor.sourceFiles = [sourceCode, mdFiles];

        writeFilesProcessor.outputFolder = path.resolve(basePath, 'docs/build');

    })

    .config(function(templateFinder) {
        templateFinder.templateFolders.unshift(path.resolve(__dirname, 'templates'));
    })

    .config(function (computePathsProcessor, computeIdsProcessor) {

        computeIdsProcessor.idTemplates.push({
                                                 docTypes  : ['content'],
                                                 getId     : function (doc) { return doc.fileInfo.baseName; },
                                                 getAliases: function (doc) { return [doc.id]; }
                                             });

        // Build custom paths and outputPaths for "content" pages (theming and CSS).
        computePathsProcessor.pathTemplates.push({
                                                     docTypes          : ['content'],
                                                     getPath           : function (doc) {
                                                         var docPath = path.dirname(doc.fileInfo.relativePath);
                                                         if (doc.fileInfo.baseName !== 'index') {
                                                             docPath = path.join(docPath, doc.fileInfo.baseName);
                                                         }
                                                         return docPath;
                                                     },
                                                     outputPathTemplate: 'partials/${path}.html'
                                                 });


        // Here we are defining our docType Module
        //
        // Each angular module will be extracted to it's own partial
        // and will act as a container for the various Components, Controllers, Services in that Module
        // We are basically specifying where we want the output files to be located
        computePathsProcessor.pathTemplates.push({
                                                     docTypes          : ['module'],
                                                     pathTemplate      : '${area}/${name}',
                                                     outputPathTemplate: 'partials/${area}/${name}.html'
                                                 });

        // Doing the same thing but for regular types like Services, Controllers, etc...
        // By default they are grouped in a componentGroup and processed via the generateComponentGroupsProcessor
        // internally in Dgeni
        computePathsProcessor.pathTemplates.push({
                                                     docTypes          : ['componentGroup'],
                                                     pathTemplate      : '${area}/${moduleName}/${groupType}',
                                                     outputPathTemplate: 'partials/${area}/${moduleName}/${groupType}.html'
                                                 });

    });


module.exports = package;

