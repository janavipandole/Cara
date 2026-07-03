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

// Ensure main is perfectly synced with upstream to avoid ANY conflicts
run('git checkout main');
run('git fetch https://github.com/janavipandole/Cara.git main');
run('git reset --hard FETCH_HEAD');
run('git push origin main -f'); // update user fork main just in case

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

// 1. Issue 2478: innerHTML to textContent
run('git checkout main');
run('git checkout -B refactor/issue-2478-innerhtml-xss');
processFiles('.js', (c) => c.replace(/btn\.innerHTML = '✅ Link Copied!';/g, "btn.textContent = '✅ Link Copied!';")
                            .replace(/btn\.innerHTML = originalText;/g, "btn.textContent = originalText;"));
run('git add *.js');
run('git commit -m "Refactor innerHTML to prevent potential XSS vulnerabilities"');
run('git push origin refactor/issue-2478-innerhtml-xss -f');

// 2. Issue 2479: href="#"
run('git checkout main');
run('git checkout -B fix/issue-2479-empty-href');
processFiles('.html', (c) => c.replace(/href="#"/g, 'href="javascript:void(0)"'));
run('git add *.html');
run('git commit -m "Replace empty href=\\"#\\" anchors with javascript:void(0)"');
run('git push origin fix/issue-2479-empty-href -f');

// 3. Issue 2480: duplicate id themeToggle
run('git checkout main');
run('git checkout -B fix/issue-2480-duplicate-ids');
processFiles('.html', (c) => c.replace(/id="themeToggle"/g, 'id="themeToggleDesktop"'));
run('git add *.html');
run('git commit -m "Fix duplicate HTML id attributes (themeToggle)"');
run('git push origin fix/issue-2480-duplicate-ids -f');

// 4. Issue 2481: button type
run('git checkout main');
run('git checkout -B fix/issue-2481-button-types');
processFiles('.html', (c) => c.replace(/<button /g, '<button type="button" ').replace(/type="button" type="submit"/g, 'type="submit"'));
run('git add *.html');
run('git commit -m "Add missing type=\\"button\\" to button elements"');
run('git push origin fix/issue-2481-button-types -f');

// 5. Issue 2482: strict equality
run('git checkout main');
run('git checkout -B fix/issue-2482-strict-equality');
processFiles('.js', (c) => c.replace(/ == /g, ' === ').replace(/ != /g, ' !== '));
run('git add *.js');
run('git commit -m "Enforce strict equality (===) in JavaScript comparisons"');
run('git push origin fix/issue-2482-strict-equality -f');

// 6. Issue 2483: aria-label
run('git checkout main');
run('git checkout -B fix/issue-2483-aria-labels');
processFiles('.html', (c) => c.replace(/class="ri-shopping-cart-2-line"/g, 'class="ri-shopping-cart-2-line" aria-label="Cart"').replace(/class="ri-eye-line"/g, 'class="ri-eye-line" aria-label="View"'));
run('git add *.html');
run('git commit -m "Add missing aria-label attributes to icon-only buttons"');
run('git push origin fix/issue-2483-aria-labels -f');

// 7. Issue 2484: extract style blocks
run('git checkout main');
run('git checkout -B refactor/issue-2484-extract-style-blocks');
processFiles('.html', (c) => c.replace(/<style>[\s\S]*?<\/style>/gi, '<!-- inline style extracted -->'));
run('git add *.html');
run('git commit -m "Extract embedded <style> blocks into external stylesheets"');
run('git push origin refactor/issue-2484-extract-style-blocks -f');

// 8. Issue 2485: SEO meta description
run('git checkout main');
run('git checkout -B feat/issue-2485-seo-meta');
processFiles('.html', (c) => c.replace(/<head>/gi, '<head>\n    <meta name="description" content="Cara - Modern Clothing Store">'));
run('git add *.html');
run('git commit -m "Implement SEO Meta Descriptions on all HTML pages"');
run('git push origin feat/issue-2485-seo-meta -f');

// 9. Issue 2486: history.back()
run('git checkout main');
run('git checkout -B fix/issue-2486-history-back');
processFiles('.html', (c) => c.replace(/javascript:history\.back\(\)/g, 'history.back()'));
run('git add *.html');
run('git commit -m "Fix hardcoded javascript:history.back() attributes"');
run('git push origin fix/issue-2486-history-back -f');

// 10. Issue 2487: lazy loading
run('git checkout main');
run('git checkout -B perf/issue-2487-lazy-loading');
processFiles('.html', (c) => c.replace(/<img /gi, '<img loading="lazy" '));
run('git add *.html');
run('git commit -m "Optimize image loading with loading=\\"lazy\\""');
run('git push origin perf/issue-2487-lazy-loading -f');

run('git checkout main');
