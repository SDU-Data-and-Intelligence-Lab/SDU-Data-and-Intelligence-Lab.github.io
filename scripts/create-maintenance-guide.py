from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
from xml.sax.saxutils import escape

OUT = Path("Colleague Website Maintenance Guide.docx")
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"

def tag(name):
    return f"{{{W}}}{name}"

def run(text, bold=False):
    props = "<w:rPr><w:b/></w:rPr>" if bold else ""
    return f'<w:r>{props}<w:t xml:space="preserve">{escape(text)}</w:t></w:r>'

def paragraph(text="", style=None, bold_prefix=None):
    ppr = f'<w:pPr><w:pStyle w:val="{style}"/></w:pPr>' if style else ""
    if bold_prefix and text.startswith(bold_prefix):
        content = run(bold_prefix, True) + run(text[len(bold_prefix):])
    else:
        content = run(text)
    return f"<w:p>{ppr}{content}</w:p>"

def bullet(text):
    return f'<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>{run(text)}</w:p>'

def placeholder(text):
    return paragraph(f"[SCREENSHOT PLACEHOLDER: {text}]")

content = [
    paragraph("Colleague Website Maintenance Guide", "Title"),
    paragraph("How to update your People entry, About page, publications, and teaching information"),
    paragraph("Version: September 2026"),
    paragraph("Overview", "Heading1"),
    paragraph("Each colleague maintains four types of information. The short entry on the lab People page is in the main lab repository. Your About page, publications, and teaching are in your own profile repository."),
    bullet("People page short text: maintained in the main lab repository, people.html."),
    bullet("About me: maintained in your own profile repository, index.html."),
    bullet("Publications: maintained in your own profile repository, data/publications/YOUR-NAME.json."),
    bullet("Teaching: maintained in your own profile repository, teaching.html."),
    paragraph("All changes are made directly on GitHub. After you commit a change, GitHub Pages normally publishes it automatically after a short delay."),
    paragraph("Before you start", "Heading1"),
    bullet("Use the profile repository assigned to you by the lab."),
    bullet("You need Write access to that repository. If you cannot edit a file, contact the site administrator."),
    bullet("Do not edit the layout, CSS, JavaScript, or other people's profiles unless specifically asked."),
    paragraph("General GitHub editing steps", "Heading2"),
    paragraph("1. Open your profile repository on GitHub."),
    paragraph("2. Open the file you want to change."),
    paragraph("3. Click the pencil icon: Edit this file."),
    paragraph("4. Make the change in the editor."),
    paragraph("5. Scroll down to Commit changes."),
    paragraph("6. Add a short commit message, for example: Update About text."),
    paragraph("7. Choose Commit directly to the master branch, then click Commit changes."),
    placeholder("Open your profile repository and click the file you want to edit."),
    paragraph("1. People page short text", "Heading1"),
    paragraph("This is the short description shown beside your photograph on the main People page. It is intentionally brief: normally one or two sentences describing your current research or role."),
    paragraph("File: people.html in the main repository:"),
    paragraph("https://github.com/SDU-Data-and-Intelligence-Lab/SDU-Data-and-Intelligence-Lab.github.io/blob/main/people.html"),
    paragraph("Find your name and edit only the text inside the person-line paragraph. Keep the existing HTML structure, links, email address, and image unchanged."),
    paragraph("Example content: Research on trustworthy AI and intelligent systems, with a focus on methods that can be used in real-world industrial settings."),
    placeholder("Find your name in people.html and edit the short person-line text."),
    paragraph("Important: this file belongs to the main lab website. You may need separate Write access to the main website repository. Your personal profile repository does not control this text."),
    paragraph("2. About me page", "Heading1"),
    paragraph("Your About page is the front page of your personal profile site."),
    paragraph("File: index.html in your own profile repository."),
    paragraph("Edit the paragraphs below the About me heading. You can update your biography, research interests, current position, and other descriptive text."),
    paragraph("Keep the following intact unless you know HTML: the navigation links, the profile image, the publication container, the Edit link, and the script near the bottom of the file."),
    placeholder("Open index.html and locate the About me text below the page title."),
    paragraph("After publishing, your page will be available at a URL like:"),
    paragraph("https://sdu-data-and-intelligence-lab.github.io/YOUR-NAME/"),
    paragraph("3. Publications", "Heading1"),
    paragraph("Publication data is maintained in one JSON file in your own profile repository:"),
    paragraph("data/publications/YOUR-NAME.json"),
    paragraph("Each publication should contain these fields:"),
    bullet("title: the complete paper title"),
    bullet("authors: the author list"),
    bullet("venue: journal, conference, workshop, or preprint venue"),
    bullet("year: publication year, written as a number"),
    bullet("url: DOI, publisher, arXiv, or another canonical publication link"),
    paragraph("Example:"),
    paragraph('{"title":"Paper title","authors":"A. Author and B. Author","venue":"Journal Name","year":2025,"url":"https://doi.org/..."}'),
    placeholder("Open data/publications/YOUR-NAME.json and edit or add a publication entry."),
    paragraph("How selection works", "Heading2"),
    paragraph("You maintain one publication list. The About page automatically selects the three newest entries from that list. You do not need to maintain a separate selected-publications list."),
    paragraph("The lab-wide Publications page reads the publication files for all members and displays entries from 2024 onward. The current personal Publications page also displays the selected three entries. If the lab later changes this to show a full personal list, the same JSON file will remain the source."),
    paragraph("To change which three papers appear in the selected section, make sure the three papers you want are the three newest entries by year. If two papers have the same year, the title determines their order."),
    paragraph("The paper title is the link. Use a stable canonical link rather than a search result or a temporary URL."),
    placeholder("Add a publication and verify the title, year, venue, and canonical link."),
    paragraph("4. Teaching", "Heading1"),
    paragraph("Teaching information is maintained in your own profile repository."),
    paragraph("File: teaching.html"),
    paragraph("Edit the course title, course link, level, ECTS, and short description inside the course list. You can copy an existing course block when adding another course."),
    paragraph("Keep the navigation, profile information, and Edit teaching link unchanged."),
    placeholder("Open teaching.html and edit the course information."),
    paragraph("Checking your changes", "Heading1"),
    paragraph("After committing a change, wait a short time and refresh your profile page. If the old version remains visible, use a hard refresh or wait for GitHub Pages to finish rebuilding."),
    bullet("Check that links open correctly."),
    bullet("Check that your name and role are spelled correctly."),
    bullet("Check that publication years are numeric and publication URLs work."),
    bullet("Check that the page still displays correctly on a phone-sized screen."),
    paragraph("Need help?", "Heading1"),
    paragraph("If you cannot edit a repository, the file is not where this guide says it is, or a page displays incorrectly after publishing, contact the lab website administrator. Include the repository name, file name, and a description of the change you attempted."),
]

body = "".join(content) + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>'
document = f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="{W}"><w:body>{body}</w:body></w:document>'
styles = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="{W}">
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:rPr><w:b/><w:sz w:val="34"/><w:szCs w:val="34"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:rPr><w:b/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:rPr><w:b/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:style>
</w:styles>"""
content_types = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>"""
rels = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""
document_rels = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>"""
numbering = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="{W}">
<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="singleLevel"/><w:lvl w:ilvl="0"><w:numFmt w:val="bullet"/><w:lvlText w:val="&#8226;"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum>
<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
</w:numbering>"""

with ZipFile(OUT, "w", ZIP_DEFLATED) as archive:
    archive.writestr("[Content_Types].xml", content_types)
    archive.writestr("_rels/.rels", rels)
    archive.writestr("word/document.xml", document)
    archive.writestr("word/styles.xml", styles)
    archive.writestr("word/numbering.xml", numbering)
    archive.writestr("word/_rels/document.xml.rels", document_rels)

print(OUT.resolve())
