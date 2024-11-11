from rasa.engine.graph import GraphComponent, ExecutionContext
from rasa.engine.storage.resource import Resource
from rasa.engine.storage.storage import ModelStorage
from rasa.shared.nlu.training_data.message import Message
from rasa.shared.nlu.training_data.training_data import TrainingData
from rasa.shared.nlu.constants import TEXT
from typing import Dict, Text, Any, List
from spellchecker import SpellChecker
from rasa.engine.recipes.default_recipe import DefaultV1Recipe

@DefaultV1Recipe.register(
    DefaultV1Recipe.ComponentType.MESSAGE_FEATURIZER, is_trainable=False
)
class SpellCheckComponent(GraphComponent):
    def __init__(self, config: Dict[Text, Any]) -> None:
        self.spell = SpellChecker()
        self.language = config.get("language", "en")

    @classmethod
    def create(
            cls,
            config: Dict[Text, Any],
            model_storage: ModelStorage,
            resource: Resource,
            execution_context: ExecutionContext,
    ) -> GraphComponent:
        return cls(config)

    def process_training_data(self, training_data: TrainingData) -> TrainingData:
        # Optional: Corrects spelling in training data
        for example in training_data.training_examples:
            if TEXT in example.data:
                corrected_text = self.correct_spelling(example.data[TEXT])
                example.set(TEXT, corrected_text)
        return training_data

    def process(self, messages: List[Message]) -> List[Message]:
        for message in messages:
            if TEXT in message.data:
                corrected_text = self.correct_spelling(message.data[TEXT])
                message.set(TEXT, corrected_text)
        return messages

    def correct_spelling(self, text: Text) -> Text:
        corrected_words = []
        words = text.split()
        for word in words:
            # Skip words with underscores or other non-alphabet characters
            if "_" in word:
                corrected_word = word
            else:
                # Only correct if word is not already correct
                corrected_word = self.spell.correction(word) if word not in self.spell else word
            # Ensure corrected_word is not None
            corrected_words.append(corrected_word if corrected_word else word)
        return " ".join(corrected_words)
