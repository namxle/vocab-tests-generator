import re
import json

def run(input_file_path, output_file_path):
    # Load file content
    with open(input_file_path, "r") as file:
        file_content = file.read()

    questions = []
    lines = file_content.strip().split("\n")
    question_id = 1

    for i in range(0, len(lines), 2):  # Every two lines form one question
        question_line = lines[i]
        options_line = lines[i + 1]

        # Extract question text and correct answer
        question_match = re.match(r"\d+\.\s(.*)", question_line)
        correct_answer_match = re.search(r"\*\w\)\s([\w\s]+)", options_line)

        if question_match and correct_answer_match:
            question_text = question_match.group(1).strip()
            correct_answer = correct_answer_match.group(1).strip()

            # Extract options
            options = re.findall(r"\w\)\s([\w\s]+)", options_line)
            answers = [{"id": idx + 1, "value": option.strip()} for idx, option in enumerate(options)]

            # Find the correct answer ID
            correct_answer_id = [idx + 1 for idx, option in enumerate(options) if option.strip() == correct_answer]

            # Build question object
            question_obj = {
                "id": question_id,
                "type": "Definition Recall (MCQ)",
                "question_name": question_text,
                "answers": answers,
                "correct_answers": correct_answer_id,
            }
            questions.append({
                "word": correct_answer.lower(),
                "questions": [question_obj]
            })

            question_id += 1

    # Save to a JSON file
    with open(output_file_path, "w") as file:
        json.dump(questions, file, indent=4)

    print(f"Questions saved to {output_file_path}")

for i in range(1, 15):
    # Specify the input file path
    if i == 8:
        continue  # Skip Day 8 as it not exist
    input_file_path = f"tests/A2_L2_Day{i}.txt"  # Replace with your actual file name
    output_file_path = f"tests/A2_L2_Day{i}M.json"  # Specify the output file name
    run(input_file_path, output_file_path)