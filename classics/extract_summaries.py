import json
import time
from time import sleep
import pickle
import os
import shutil

from tqdm.autonotebook import tqdm
from revChatGPT.revChatGPT import Chatbot
from jinja2 import Template, Environment, FileSystemLoader


with open("token", "r") as f:
    token = f.read()
    
# For the config please go here:
# https://github.com/acheong08/ChatGPT/wiki/Setup
config = {
    #"email": "<YOUR_EMAIL>",
    #"password": "<YOUR_PASSWORD>",
    "session_token": token, # Deprecated. Use only if you encounter captcha with email/password
    #"proxy": "<HTTP/HTTPS_PROXY>"
}

chatbot = Chatbot(config, conversation_id=None)


def get_reply(request):
    chatbot.reset_chat()
    response = chatbot.get_chat_response(request, output="text")
    return response["message"]


def get_json_response(request, n, retries):
    # Keep track of the number of retries
    num_retries = 0

    # The parsed JSON response
    response = None

    # Keep trying until we get a valid JSON response or reach the retry limit
    while response is None and num_retries <= retries:
        # Call the get_reply function
        reply = get_reply(request)

        # Check if the reply contains a valid JSON
        try:
            # Extract the JSON string from the reply
            json_string = reply[reply.index('```') + 3 : reply.rindex('```')]

            # Parse the JSON string and store it in the response variable
            response = json.loads(json_string)

            # Check if the JSON contains the expected number of objects
            if len(response) != n:
                # Set the response to None to retry
                response = None
        except ValueError:
            # The reply does not contain a valid JSON string
            pass

        # Wait for 5 seconds before retrying
        time.sleep(5)

        # Increment the number of retries
        num_retries += 1

    # Check if we have a valid JSON response
    if response is not None:
        # Return the parsed JSON response
        return response
    else:
        # Raise a RuntimeError with the latest reply as the error message
        raise RuntimeError(f"Failed to get a valid JSON response after {retries} retries. Latest reply: {reply}")
        
        
def get_classic_literature_works(json_object):
    # Get the list of genres from the JSON object
    genres = [x["genre"] for x in json_object]

    # The list of classic literature works for each genre
    classic_literature_works = []

    # Loop through the genres
    for genre in genres:
        # The request text for the current genre
        request = f"Please provide 10 most prominent classic literature works in the {genre} genre in JSON format. It should be an array of objects with fields title, author, and publication_year."

        try:
            # Call the get_json_response function to get the list of classic literature works for the current genre
            response = get_json_response(request, n=10, retries=10)

            # Add the response to the list of classic literature works
            classic_literature_works.append(response)
        except RuntimeError:
            # An error occurred while getting the response for the current genre
            # Add None to the list of classic literature works
            classic_literature_works.append(None)

    # Return the list of classic literature works for each genre
    return classic_literature_works


def get_long_form_summaries(classic_literature_works):
    # The list of long-form summaries for each work
    long_form_summaries = []

    # Create a tqdm progress bar for the outer loop (looping through the genres)
    pbar = tqdm(total=len(classic_literature_works), desc="Genres")

    # Loop through the genres
    for works in classic_literature_works:
        # The list of long-form summaries for the current genre
        genre_summaries = []

        # Create a tqdm progress bar for the inner loop (looping through the works in each genre)
        inner_pbar = tqdm(total=len(works), desc="Works", leave=False)

        # Loop through the works in the current genre
        for work in works:
            # The request text for the current work
            request = f"Provide a long-form summary of {work['title']} by {work['author']}"

            # Set the summary to None
            summary = None

            # Try to call the get_reply function to get the long-form summary for the current work
            try:
                summary = get_reply(request)
            except:
                # An error occurred while getting the summary
                # The summary variable is already set to None
                pass

            # Add the summary to the list of long-form summaries for the current genre
            genre_summaries.append(summary)

            # Update the inner progress bar
            inner_pbar.update(1)

            # Wait for 5 seconds before the next request
            sleep(5)

        # Add the list of long-form summaries for the current genre to the overall list of summaries
        long_form_summaries.append(genre_summaries)

        # Update the outer progress bar
        pbar.update(1)

        # Close the inner progress bar
        inner_pbar.close()

    # Close the outer progress bar
    pbar.close()

    # Return the list of long-form summaries for each work
    return long_form_summaries


def generate_index_page(genres, featured_works):
  # Load the template
  with open("index.html.template") as template_file:
    template = Template(template_file.read())

  # Generate the page by rendering the template with the genres data
  return template.render(genres=genres, featured_works=featured_works)

def get_featured_works(genres, works, featured_works):
  featured_works_list = []
  found_works = set()  # Set to keep track of works that have already been found
  for i in range(len(genres)):
    genre = genres[i]
    for work in works[i]:
      if work['title'] in featured_works and work['title'] not in found_works:
        work['url'] = '{}.html#{}'.format(genre['genre'].lower(), work['title'].lower().replace(' ', '_'))
        featured_works_list.append(work)
        found_works.add(work['title'])
  return featured_works_list


def generate_genre_pages(genres, works, summaries):
  env = Environment(loader=FileSystemLoader('.'), trim_blocks=True, lstrip_blocks=True)
  # Load the template
  template = env.get_template('genre.html.template')

  # Generate HTML pages for each genre
  for i in range(len(genres)):
    genre = genres[i]
    genre_works = works[i]
    genre_summaries = summaries[i]

    # Populate the template context with genre information and works
    context = {
      'genre': genre['genre'],
      'description': genre['description'],
      'works': [{
        'title': work['title'],
        'author': work['author'],
        'publication_year': work['publication_year'],
        'summary': genre_summaries[j]
      } for j, work in enumerate(genre_works)]
    }

    # Render the HTML page for the genre
    html = template.render(context)

    # Save the HTML page to a file
    with open('generated/{}.html'.format(genre['genre'].lower()), 'w') as f:
      f.write(html)
    

request = \
"""Please provide 10 most important genres of classic literature in JSON format.
It should be an array of objects with fields: genre, description"""

genres = get_json_response(request, 10, 5)

for g in genres:
    print(g["genre"])
    print(g["description"])
    print()
    
works = get_classic_literature_works(genres)
summaries = get_long_form_summaries(works)

featured = ["Moby-Dick", "Pride and Prejudice", "Hamlet", "The Odyssey"]

if not os.path.exists("generated"):
    os.mkdir("generated")

# Create the HTML page
index_html = generate_index_page(genres, get_featured_works(genres, works, featured))

# Save the HTML page to a file
with open("generated/index.html", "w") as f:
    f.write(index_html)
    
generate_genre_pages(genres, works, summaries)
shutil.copy("styles.css", "generated")
