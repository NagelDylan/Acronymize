from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'emoji']

class LevelupLevelSerializer(serializers.Serializer):
        puzzle_id = serializers.IntegerField()
        position = serializers.IntegerField()
        par_score = serializers.IntegerField()
        score = serializers.IntegerField()
        attempts_data = serializers.CharField(allow_null=True)