/*
 JiraConnect.js v1.0

 Written by Justin Winthers

 Embeddable feedback tool for any website that builds an associated Jira Issue

 JiraConnect builds a dynamic dom form to collect issue data from a given user
 It takes a snapshot of the current page and posts this image to the JirConnect server
 and finally to the respective Jira server and associated ticket.

 Dependencies:
 JiraConnect uses the html2canvas library for clientside snapshots in Base64 format
 JiraConnect uses the form-data library for multi-part posting to the JiraApi
 JiraConnect API runs under IISNode so that users can be authenticated via Windows Auth
 JiraConnect minify's on the fly using coderaiser's node minify library
 */