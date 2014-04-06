var pkg     = require('../package.json')._settings,
    path    = require('path'),
    join    = path.join,
    environ = require('bem-environ')({ libDir: pkg.libs }),

    PRJ_ROOT     = environ.PRJ_ROOT,
    LIBS_PATH    = join(PRJ_ROOT, pkg.libs),
    BLOCKS_PATH  = join(PRJ_ROOT, pkg.root, pkg.blocks),
    BUNDLES_PATH = join(pkg.root, pkg.bundles);

// npm package with tech for autoprefixer
// more info here: https://github.com/bem/bem-tools-autoprefixer
require('bem-tools-autoprefixer').extendMake(MAKE);
environ.extendMake(MAKE);

MAKE.decl('Arch', {
    // this is customized path to bundles
    // more info here: http://bem.info/tools/bem/bem-tools/customization
    getBundlesLevels: function() {
        return [
            BUNDLES_PATH
        ];
    }
});

MAKE.decl('BundleNode', {

    // techs for bundles build
    getTechs: function() {
        return [
            'bemjson.js',
            'bemdecl.js',
            'deps.js',
            'bemhtml',
            'js',
            'scss',
            'prefix.css',
            'html'
        ];
    },

    // techs in parallel processes
    getForkedTechs : function() {
        return this.__base().concat(['js', 'scss']);
    },

    // levels for build
    getLevels : function() {
        // libs levels
        return [
            // bem-core without i-bem.js
            // see how in bem-protein/app/blocks/base/page/page.deps.js
            'bem-core/common.blocks',
            // You can also install bem-components (use bower-npm-install)
            // and uncomment next lines for using i-bem.js blocks
            //'bem-components/common.blocks',
            //'bem-components/desktop.blocks',
            'bem-protein/app/blocks/base',
            'bem-protein/app/blocks/typo',
            'bem-protein/app/blocks/grid',
            'bem-protein/app/blocks/buttons',
            'bem-protein/app/blocks/forms',
            'bem-protein/app/blocks/navigation',
            'bem-protein/app/blocks/lists',
            'bem-protein/app/blocks/tables',
            'bem-protein/app/blocks/wrappers',
            'bem-protein/app/blocks/windows',
            'bem-protein/app/blocks/progress',
            'bem-protein/app/blocks/js'
        ]
        .map(function(level) { return path.resolve(LIBS_PATH, level); })
        // this project levels
        .concat([
            // declare your blocks here like this:
            // 'menu'
            // 'alerts'
            // 'yet'
        ]
        .map(function(level) { return path.resolve(BLOCKS_PATH, level); }));
    },

    'create-prefix.css-node' : function(tech, bundle, magic) {
        return this.createDefaultTechNode.call(this, 'css', bundle, magic);
    },

    'create-prefix.css-optimizer-node' : function(tech, sourceNode, bundle) {
        var borschikCss = this['create-css-optimizer-node'];
        return borschikCss.apply(this, arguments).map(function(source) {
            var node = this.createAutoprefixerNode(tech, source, bundle);
            return borschikCss.call(this, tech, node, bundle);
        }, this);
    }
});

// this is node based on autoprefixer
// more info here: https://github.com/ai/autoprefixer
MAKE.decl('AutoprefixerNode', {
    getBrowsers : function() {
        // support browsers: only 2 last versions
        return [
            'last 2 versions'
        ];
    }
});