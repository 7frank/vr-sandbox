


const path = require('path');
const fs = require('fs');
const Webpack = require('webpack');
const precss = require('precss');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WpPluginWatchOffset = require('@ff0000-ad-tech/wp-plugin-watch-offset');
const helper = require('../server/devel/utils/helpers');
const argv = helper.parseArguments(process.argv.slice(2));


const isDevel = (process.env.NODE_ENV ?process.env.NODE_ENV.trim()!== 'production':true) && !argv['env.production'];
const isProduction = !isDevel;
console.log("process.env.NODE_ENV",process.env.NODE_ENV)
console.log("isDevel",isDevel)
console.log("isProduction",isProduction)

//------------------------
// bad practice...

//require  from '../devel/utils/clioutput';
var clioutput;
if (!isProduction)
    clioutput = require  ('../server/devel/utils/clioutput').default;
    else
    clioutput = require  ('../build/server/utils/clioutput').default;



//------------------------



console.log("isDevel",isDevel,"isProduction",isProduction)


const isHot = argv['hot'] || false;
const src = path.resolve(process.cwd(), 'src');
const dist = path.resolve(process.cwd(), 'build/client');
const jsDir = path.resolve(dist, 'js');
const cssDir = path.resolve(dist, 'css');
const vendorDir = path.resolve(dist, 'vendors');
const publicPath = '/';

const devPlugins = () => {

    if (isDevel) {
        clioutput.hr();
        const vendorManifest = path.resolve(vendorDir, 'vendors.manifest.json');
        const indexHTML = path.resolve(src, 'index.html');

        // Check that vendor manifest exists
        if (!fs.existsSync(vendorManifest)) {
            clioutput.error('Vendor manifest json is missing.');
            clioutput.error('Please run `npm run vendor:perf`');
            process.exit(0);
        }

        // Check that main index.html exits
        if (!fs.existsSync(indexHTML)) {
            clioutput.error('src/index.html is missing.');
            process.exit(0);
        }

        const generateHtml = () => {
            const jsdom = require("jsdom");
            const {JSDOM} = jsdom;

            const dom = new JSDOM(fs.readFileSync(indexHTML, 'utf8').toString());
            dom.window.document.head.insertAdjacentHTML('beforeend', `<script type="text/javascript" src="${publicPath}vendors/vendors-bundle.js"></script>`);
            return '<!DOCTYPE HTML>' + '\n' + dom.window.document.documentElement.outerHTML;
        };
        clioutput.info('starting...');
        return [
            new Webpack.DllReferencePlugin({
                context: process.cwd(),
                manifest: require(vendorManifest)
            }),

            new HtmlWebpackPlugin({
                templateContent: generateHtml(),
                inject: 'head',
                chunksSortMode: 'none',
                xhtml: true,
            }),
        ];
    }
    return [];
};

const hotPlugins = isHot ? [
    new Webpack.HotModuleReplacementPlugin({
        multiStep: false,
    }),
] : [];

const prodPlugins = isProduction ? [
    new Webpack.optimize.CommonsChunkPlugin({
        names: ['vendors', 'manifest'],
    }),

    new HtmlWebpackPlugin({
        template: './index.html',
        inject: 'head',
        chunksSortMode: 'dependency',
        xhtml: true,
        minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
        },
    }),

    new Webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false,
        quiet: true
    }),
//FIXME
  /*  new Webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
            screw_ie8: true,
            conditionals: true,
            unused: true,
            comparisons: true,
            sequences: true,
            dead_code: true,
            evaluate: true,
            if_return: true,
            join_vars: true,
        },
        output: {
            comments: false
        },
        sourceMap: true
    }),*/
] : [];


const cssRules = isHot ? [


    {
        test: /\.css$/,
        include: [
            src,
            path.resolve(process.cwd(), 'node_modules')
        ],
        use: [
            'raw-loader',
            'style-loader',
            'css-loader',
            'postcss-loader',
            'resolve-url-loader',
        ]
    },
    {
        test: /\.scss$/,
        include: [
            src,
            path.resolve(process.cwd(), 'node_modules')
        ],
        use: [
            'style-loader',
            'css-loader',
            {loader: 'postcss-loader', options: {sourceMap: true}},
            'resolve-url-loader',
            {loader: 'sass-loader', query: {sourceMap: isProduction ? 'compressed' : 'expanded'}},
        ]
    },
] : [
    { //for css that is imported inline TODO not working atm
        test: /\.css$/,
        include: [
            src,
            // path.resolve(process.cwd(), 'node_modules')
        ],
        use: [
            {loader: 'css-loader', options: {sourceMap: 'inline'}},
            {loader: 'postcss-loader', options: {sourceMap: true}},
            'resolve-url-loader'
        ]

    },
    { //for css that is handled via the ExtractTextPlugin
        test: /\.css$/,
        include: [
            //  src,
            path.resolve(process.cwd(), 'node_modules')
        ],
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
                {loader: 'css-loader', options: {sourceMap: 'inline'}},  //'inline'
                {loader: 'postcss-loader', options: {sourceMap: true}},
                'resolve-url-loader'
            ]
        })
    },
    {
        test: /\.scss$/,
        include: [
            src,
            path.resolve(process.cwd(), 'node_modules')
        ],
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
                {loader: 'css-loader', options: {sourceMap: true}},
                {loader: 'postcss-loader', options: {sourceMap: true}},
                'resolve-url-loader',
                {loader: 'sass-loader', options: {sourceMap: isProduction ? 'compressed' : 'expanded'}}
            ]
        })
    }
];

module.exports = {
    context: src,
    devtool: isProduction ? undefined : 'cheap-module-eval-source-map',
    cache: !isProduction,
    bail: isProduction,
    target: 'web',
    resolve: {
        modules: [
            'src',
            path.resolve(process.cwd(), 'node_modules'),
        ],
        extensions: ['.js', '.jsx', '.json', '.css', '.scss', '.html', '.ts', '.tsx']
    },
    entry: helper.sanitizeObject({
        vendors: isProduction ? ['babel-polyfill', './js/vendors.js'] : [],
        'aframe-project': (isHot ? [
            '../server/devel/utils/webpack-runtime.js',
            'webpack-hot-middleware/client?path=/webpack-hot-module-replace&timeout=20000&reload=true',
        ] : [] ).concat(["babel-polyfill",
            './js/index.js',
            './sass/entry.scss',
        ]),
    }),

    output: {
        filename: path.join('js', (isProduction ? '[name].[hash].js' : '[name].js')),
        chunkFilename: isProduction ? '[name].[hash].chunk.js' : '[name].chunk.js',
        path: dist,
        publicPath: publicPath,
        pathinfo: !isProduction,
    },
    performance: {
        hints: isProduction ? 'warning' : false,
    },

    module: {
        rules: [
            {
                test: /\.(glsl|frag|vert)$/,
                use: [
                    // 'console-loader',
                    //'raw-loader',
                    {
                        loader: 'glsl-template-loader', options: {
                        rootPath: '/', // Path to look absolute path chunks at
                        chunksExt: 'glsl', // Chunks extension
                        varPrefix: '$', // Every valid name that starts with this symbol will be treated as a template variable
                        es5: true // Produce template compatible with es5 browsers (IE11)
                    }
                    }
                ],
                include: [src]

            },
            {test: /\.tsx?$/, loader: 'ts-loader'},
            {test: /\.tsx$/, loader: 'ts-loader'},
            {
                test: /\.js[x]?$/,
                enforce: 'pre',
                use: {
                    loader: 'eslint-loader',
                    options: {
                        configFile: './config/eslint.json',
                        fix: true
                    },
                },
                include: [src],
                exclude: [/node_modules/],
            }, {
                test: /\.js[x]?$/,
                include: [src],
                exclude: [/node_modules/],
                use: {
                    loader: 'babel-loader'
                },
            }, {
                test: /\.html$/,
                use: {
                    loader: 'html-loader',
                },
            }, {
                test: /\.hbs/,
                use: {
                    loader: "handlebars-loader",
                },
            }, {
                test: /\.json$/,
                use: {
                    loader: 'json-loader',
                },
            }, {
                test: /\.(jpg|jpeg)$/,
                use: 'url-loader?name=[name].[ext]&limit=8192&mimetype=image/jpg'
            }, {
                test: /\.gif$/,
                use: 'url-loader?name=[name].[ext]&limit=8192&mimetype=image/gif'
            }, {
                test: /\.png$/,
                use: 'url-loader?name=[name].[ext]&limit=8192&mimetype=image/png'
            }, {
                test: /\.svg$/,
                use: 'url-loader?name=[name].[ext]&limit=8192&mimetype=image/svg+xml'
            }
            , {
                test: /\.woff?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: ['url-loader?name=[name].[ext]&limit=100000&mimetype=application/font-woff']
            }, {
                test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: ['url-loader?name=[name].[ext]&limit=100000&mimetype=application/font-woff2']
            }, {
                test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: ['file-loader?name=[name].[ext]&limit=100000&mimetype=application/octet-stream']
            }, {
                test: /\.otf(\?.*)?$/,
                use: 'file-loader?name=[name].[ext]&limit=10000&mimetype=font/opentype'
            },
        ].concat(cssRules)
    },
    plugins: [
        new WpPluginWatchOffset(),

        new Webpack.DefinePlugin({
            'process.env.NODE_ENV': isProduction ? JSON.stringify('production') : JSON.stringify('development'),
            __DEV__: !isProduction,
        }),

        new Webpack.ProvidePlugin({
            'fetch': 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch',

        }),

        new Webpack.LoaderOptionsPlugin({
            minimize: isProduction,
            debug: !isProduction,
            stats: {
                colors: true
            },
            options: {
                context: src,
                output: {
                    path: dist,
                },
                postcss: [
                    precss,
                    autoprefixer({
                        browsers: [
                            'last 2 versions',
                            'ie >= 11',
                        ],
                    }),
                ],
            },
            eslint: {
                failOnWarning: false,
                failOnError: true
            },
        }),

        new Webpack.NoEmitOnErrorsPlugin(),

        new ExtractTextPlugin({
            filename: path.join('css', (isProduction ? '[name].[chunkhash].css' : '[name].css')),
            disable: false,
            allChunks: true
        }),

        new StyleLintPlugin({
            configFile: './config/stylelint.json',
            context: 'src/sass',
            files: '**/*.scss',
            syntax: 'scss',
            failOnError: false
        }),

        new CopyWebpackPlugin([
            {from: 'assets', to: 'assets'},
            {from: '../node_modules/aframe-material-snickell/assets', to: 'assets'},
            {from: '../node_modules/beta-dev-zip/lib', to: 'lib/zip'},
            {from: '../node_modules/@nk11/core-components/dist/assets', to: 'assets'},
            {from: '../node_modules/easyrtc/api/easyrtc.js', to: 'lib'},
            {from: '../src/js/dragonbones/dragonBones-three-lib.js', to: 'lib'}

        ]),

        new Webpack.NamedModulesPlugin(),

    ].concat(devPlugins()).concat(hotPlugins).concat(prodPlugins)
};
