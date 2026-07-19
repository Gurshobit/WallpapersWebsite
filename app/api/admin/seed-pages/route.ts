import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";
import { jsonError } from "@/lib/api-response";

const PAGES = [
  {
    title: "DMCA",
    slug: "dmca",
    sortOrder: 1,
    content: `<h1>DMCA</h1>
<p>This is our policy to respond to Clear all Notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act.</p>
<p>In addition, We have right to promptly terminate the accounts of Repeat Infringers Without any Notice.</p>
<p>HDWallpapers.site Team (Moderators or Admins) Response Quickly to claims of copyright infringement that are reported to us.</p>
<p>For any queries regarding DMCA or Copyright Policy, Mail Us at <a href="mailto:legal@hdwallpapers.site">legal@hdwallpapers.site</a> or Use Our <a href="/contact">Contact Us Page</a>.</p>
<p>Read More about Our <a href="/pages/copyright-policy">Copyright Policy</a>.</p>`,
  },
  {
    title: "Privacy Policy",
    slug: "privacy-policy",
    sortOrder: 2,
    content: `<h1>Privacy Policy</h1>
<p>The privacy of our visitors is Very important to us. That is Why We use Firewalls on Our Servers and SSL Certificate to Provide 256-Bit Encryption While Login to Our Server.</p>
<p>At www.hdwallpapers.site, we recognize that privacy of your personal information is very important.</p>
<p>Here is information on what types of personal information we receive and collect when you use visit www.hdwallpapers.site, and how we safeguard your information.</p>
<p><strong>We never sell your personal information to third parties.</strong></p>
<h2>Log Files</h2>
<p>As with most other websites, we collect and use the data contained in log files. The information in the log files include your IP (internet protocol) address, your ISP (internet service provider, such as JIO, AIRTEL, VODAFONE, AOL or Shaw Cable), the browser you used to visit our site (such as Internet Explorer or Firefox), the time you visited our site and which pages you visited throughout our site.</p>
<p>We Use Google Analytics Tool for Analysing Traffic to Our Website.</p>
<h2>Cookies and Web Beacons</h2>
<p>We do not use cookies to store information, such as your personal preferences when you visit our site.</p>
<p>We also use third party advertisements on www.hdwallpapers.site to Keep our Wallpapers Community Alive.</p>
<p>Some of these advertisers may use technology such as cookies and web beacons when they advertise on our site, which will also send these advertisers (such as Google through the Google AdSense program, DoubleClick Dart) information including your IP address, your ISP, the browser you used to visit our site, and in some cases, whether you have Flash installed.</p>
<p>You can choose to disable or selectively turn off our cookies or third-party cookies in your browser settings, or by managing preferences in programs such as Norton Internet Security or Any Other AntiVirus.</p>
<h2>Privacy Contact Information</h2>
<p>If you have any questions, concerns, or comments regarding our privacy policy, Copyright Policy or DMCA You Can contact us using the information below:</p>
<p>By e-mail: <a href="mailto:legal@hdwallpapers.site">legal@hdwallpapers.site</a> or use our Contact Form.</p>
<p>We reserve the right to make improvements to this policy.</p>`,
  },
  {
    title: "Copyright Policy",
    slug: "copyright-policy",
    sortOrder: 3,
    content: `<h1>Copyright Policy</h1>
<h2>For Users</h2>
<p>All visitors of this Site please pay attention here. You are allowed to download all content from this site for your desktop backgrounds only.</p>
<p>You are not permitted to use commercially (for example: In website backgrounds, for selling, on walls of social sites).</p>
<p>If you want to use for commercial purpose please contact the owner or copyright holder of wallpaper.</p>
<h2>For Content Owners or Copyright Holders</h2>
<p>All the Wallpapers on this site are collected from various search engines. We always respect your work for creating such beautiful and wonderful wallpapers. We request our users to co-operate with our copyright policy.</p>
<p>If you are not satisfied with our copyright policy or have any queries regarding DMCA or Copyright Policy, Mail Us at <a href="mailto:legal@hdwallpapers.site">legal@hdwallpapers.site</a>. Please contact us through our <a href="/contact">Contact Us page</a>.</p>
<p>Your content will be removed in 12–24 hours.</p>
<p>Read Our <a href="/pages/terms-of-service">Terms of Service</a>.</p>`,
  },
  {
    title: "Terms of Service",
    slug: "terms-of-service",
    sortOrder: 4,
    content: `<h1>Terms of Service</h1>
<p>First of All, Thanks for Choosing Us to Serve You.</p>
<p>Please Read these Terms of Service Agreement Carefully. By Using "HDWallpapers.site" or Signing Up to This Community, You are Agreeing to these terms.</p>
<p>This Agreement will Explain you the acceptable use of HDWallpapers.site Service and Community.</p>
<h2>Definitions</h2>
<p>"HDWallpapers.site" is Free Wallpapers Sharing Community. We Provide this service through this url "https://www.hdwallpapers.site".</p>
<p>We Refer it as a Social Community Website. "HDWallpapers.site" is Property of and operated by Infinity LLC ("HDWallpapers.site","We","Us").</p>
<p>Membership is Optional For Downloading. But If You want to share your Work you will have to become a member of HDWallpapers.site.</p>
<h2>Account &amp; Access</h2>
<p><strong>1. Access:</strong> Access to hdwallpapers is completely free. You Need not Pay for any Services. You can Access our Site at Desktop, Laptop, Mobile or Tablet. Membership is optional for Downloading but necessary to Upload Wallpapers. This Website is safe for Children above Age 13.</p>
<p><strong>2. Account:</strong> After Signing Up, You have to Activate Your Account by clicking a Link in Your Email Inbox.</p>
<ul>
<li><strong>2.1. Termination:</strong> Your Account can be Terminated if You Break Rules and Abuse any of this agreement.</li>
<li><strong>2.2. Eligibility:</strong> If Your Age is 13 or more and You Agree these terms then you are Eligible to Create Account.</li>
<li><strong>2.3. Account Password:</strong> Your Password is Encrypted in databases.</li>
<li><strong>2.4. Account Closing:</strong> You Can Close Your Account at anytime.</li>
<li><strong>2.5. Subscriptions:</strong> By Default, Your Newsletter Service is Enabled but you can Disable in Your Profile.</li>
</ul>
<h2>Rules &amp; Abuse</h2>
<p><strong>3. General Rules:</strong></p>
<ul>
<li>3.1. You Must Follow all Our Policies (Copyright Policy, Privacy Policy and DMCA)</li>
<li>3.2. You Can't Violate Acceptance of Use Policy.</li>
<li>3.3. You Can't Upload Adult, Nude or Semi Nude Wallpapers.</li>
<li>3.4. You Can't use Bad Words as Wallpaper Titles or in Descriptions.</li>
</ul>
<p><strong>4. Abuse:</strong></p>
<ul>
<li>4.1. Bandwidth Abuse: You are Not allowed to Directly Link Wallpapers.</li>
<li>4.2. Report Abuse: If You Feel at any Point, You are Being Offended by Our Content, You Can Report abuse through Contact Us Form.</li>
</ul>
<h2>Rights</h2>
<p><strong>5.1. Our Rights:</strong> We have Some Rights Reserved like Our Logo and Website Design. We have Right to Decide either to host a wallpaper or not.</p>
<p><strong>5.2. User Rights:</strong> If You Upload any Wallpaper, You Either Must be Owner of Content or have Permission from Owner or Content from Open Source Resources.</p>
<h2>Disclaimer</h2>
<p><strong>6. Limited Liability:</strong> HDWallpapers.site, its Owners, its Moderators, its Administrator and its partners Shall Not be Responsible for any damage, injury or loss as result of Using HDWallpapers.site.</p>
<p><strong>7. Disclaimer:</strong> We are Web Based Community Supported Website and We Mostly Collect data from Open Source Resources, Search Engines and Free Content Providers.</p>
<h2>Change</h2>
<p><strong>8. Change:</strong> We have Right to Make Changes in these Terms of Service at any time. Members will be Notified by E-Mail and Visitors will Be Notified by Notification on Website. You Will Have 15 Days after Terms Of Service Update Notification to Report Us.</p>
<p><em>Last Updated Date: 05-May-2017</em></p>`,
  },
];

export async function POST() {
  const results: string[] = [];
  try {
    await requireAdmin();
    for (const page of PAGES) {
      const existing = await db
        .select({ id: pages.id })
        .from(pages)
        .where(eq(pages.slug, page.slug))
        .limit(1);

      if (existing.length > 0) {
        results.push(`• ${page.title} — already exists`);
        continue;
      }
      await db.insert(pages).values({
        title: page.title,
        slug: page.slug,
        content: page.content,
        status: "published",
        showInFooter: true,
        sortOrder: page.sortOrder,
      });
      results.push(`✓ Created: ${page.title}`);
    }
    return NextResponse.json({ ok: true, results });
  } catch (err) {
    return jsonError(err, 500);
  }
}
