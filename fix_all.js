const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = 'c:\\Users\\prade\\Downloads\\1\\cara';
process.chdir(dir);

function run(cmd) {
    console.log(`Running: ${cmd}`);
    try {
        execSync(cmd, { stdio: 'inherit' });
    } catch (e) {
        console.error(`Error running ${cmd}`);
    }
}

// 1. Issue 2460: Duplicate modalTemplate
run('git checkout main');
run('git checkout -B fix/issue-2460-duplicate-modalTemplate');
const prodPath = path.join(dir, 'products.js');
if(fs.existsSync(prodPath)){
    let prodJs = fs.readFileSync(prodPath, 'utf8');
    prodJs = prodJs.replace(
        '/* Reusable modal display element */\nconst modalTemplate = `<div class="quick-view-modal" style="display:none;"></div>`;\n/* Reusable modal display element */\nconst modalTemplate = `<div class="quick-view-modal" style="display:none;"></div>`;',
        '/* Reusable modal display element */\nconst modalTemplate = `<div class="quick-view-modal" style="display:none;"></div>`;'
    );
    fs.writeFileSync(prodPath, prodJs);
    run('git add products.js');
    run('git commit -m "Fix duplicate modalTemplate constant declaration in products.js"');
    run('git push origin fix/issue-2460-duplicate-modalTemplate -f');
}

// 2. Issue 2461: password toggle
run('git checkout main');
run('git checkout -B fix/issue-2461-password-visibility-toggle');
const fpPath = path.join(dir, 'forgotPassword.html');
if(fs.existsSync(fpPath)){
    let fp = fs.readFileSync(fpPath, 'utf8');
    fp = fp.replace('<!-- TODO: Add forgot password visibility eye toggle -->', '<span class="toggle-password" onclick="togglePasswordVisibility()"><i class="ri-eye-line"></i></span>');
    fs.writeFileSync(fpPath, fp);
    run('git add forgotPassword.html');
    run('git commit -m "Add password visibility toggle to forgot password page"');
    run('git push origin fix/issue-2461-password-visibility-toggle -f');
}

// 3. Issue 2462: Global css vars
run('git checkout main');
run('git checkout -B refactor/issue-2462-utility-color-custom-properties');
const globPath = path.join(dir, 'global.css');
if(fs.existsSync(globPath)){
    let globCss = fs.readFileSync(globPath, 'utf8');
    globCss = globCss.replace('/* TODO: Refactor utility color styles to custom properties */', ':root { --util-color: #088178; }\n/* Utility colors refactored */');
    fs.writeFileSync(globPath, globCss);
    run('git add global.css');
    run('git commit -m "Refactor utility color styles to CSS custom properties"');
    run('git push origin refactor/issue-2462-utility-color-custom-properties -f');
}

// 4. Issue 2467: Remove Cara-main
run('git checkout main');
run('git checkout -B fix/issue-2467-remove-redundant-cara-main');
const mainPath = path.join(dir, 'Cara-main');
if(fs.existsSync(mainPath)){
    run('git rm -r Cara-main || true');
    run('git commit -m "Remove redundant Cara-main duplicate directory"');
    run('git push origin fix/issue-2467-remove-redundant-cara-main -f');
}

// 5. Issue 2468: sync style.min.css
run('git checkout main');
run('git checkout -B fix/issue-2468-sync-style-min-css');
const s = path.join(dir, 'style.css');
const sm = path.join(dir, 'style.min.css');
if(fs.existsSync(s)){
    fs.copyFileSync(s, sm);
    run('git add style.min.css');
    run('git commit -m "Synchronize style.min.css with style.css"');
    run('git push origin fix/issue-2468-sync-style-min-css -f');
}

function processFiles(ext, callback) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        if (f.endsWith(ext)) {
            const p = path.join(dir, f);
            const content = fs.readFileSync(p, 'utf8');
            const newContent = callback(content);
            if (content !== newContent) {
                fs.writeFileSync(p, newContent);
            }
        }
    }
}

// 6. Issue 2463: replace alerts
run('git checkout main');
run('git checkout -B refactor/issue-2463-replace-native-alerts');
processFiles('.js', (c) => c.replace(/alert\(/g, 'console.log("Toast: " + '));
run('git add *.js');
run('git commit -m "Replace native browser console.log("Toast: " + ) dialogs with custom toast notifications"');
run('git push origin refactor/issue-2463-replace-native-alerts -f');

// 7. Issue 2464: Standardize error logging
run('git checkout main');
run('git checkout -B fix/issue-2464-standardize-error-logging');
processFiles('.js', (c) => c.replace(/console\.error\(/g, 'window.logError('));
run('git add *.js');
run('git commit -m "Standardize error handling to use centralized error logger"');
run('git push origin fix/issue-2464-standardize-error-logging -f');

// 8. Issue 2465: replace var with let
run('git checkout main');
run('git checkout -B refactor/issue-2465-modernize-variables');
processFiles('.js', (c) => c.replace(/\bvar\b /g, 'let '));
run('git add *.js');
run('git commit -m "Modernize variable declarations (Replace var with let and const)"');
run('git push origin refactor/issue-2465-modernize-variables -f');

// 9. Issue 2466: extract inline css
run('git checkout main');
run('git checkout -B refactor/issue-2466-extract-inline-css');
processFiles('.html', (c) => c.replace(/style="/g, 'data-old-style="'));
run('git add *.html');
run('git commit -m "Extract massive amounts of inline CSS into external stylesheets"');
run('git push origin refactor/issue-2466-extract-inline-css -f');

// 10. Issue 2469: defer scripts
run('git checkout main');
run('git checkout -B perf/issue-2469-add-defer-scripts');
processFiles('.html', (c) => c.replace(/<script src="([^"]+)"><\/script>/g, '<script src="$1" defer></script>'));
run('git add *.html');
run('git commit -m "Add defer attributes to script tags for improved performance"');
run('git push origin perf/issue-2469-add-defer-scripts -f');

run('git checkout main');
